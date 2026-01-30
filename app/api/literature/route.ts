import { NextRequest, NextResponse } from 'next/server';
import { validateLiteratureRequest, type LiteratureArticle, type LiteratureResponse, type ErrorResponse } from '@/lib/schema';
import { ZodError } from 'zod';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

// Force Node.js runtime (uses in-memory cache)
export const runtime = 'nodejs';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map<string, { ts: number; data: LiteratureResponse }>();

function buildCacheKey(input: { genes: string[]; topics?: string[]; max_results: number }): string {
  const genes = [...input.genes].map(s => s.trim().toUpperCase()).sort().join(',');
  const topics = (input.topics || []).map(s => s.trim().toLowerCase()).sort().join(',');
  return `genes=${genes}|topics=${topics}|max=${input.max_results}`;
}

function buildPubMedQuery(genes: string[], topics: string[] | undefined): string {
  // Keep queries conservative and educational-focused:
  // - Prefer reviews/guidelines/meta-analyses
  // - Search title/abstract to keep relevance
  // - Limit to last ~10 years to reduce outdated material
  const genePart = genes.map(g => `${g}[tiab]`).join(' OR ');
  const topicPart = (topics || []).map(t => `"${t.replace(/"/g, '')}"[tiab]`).join(' OR ');

  const geneticsContext = '(genetic[tiab] OR hereditary[tiab] OR variant[tiab] OR mutation[tiab])';
  const publicationType = '(review[pt] OR guideline[pt] OR meta-analysis[pt])';
  const dateFilter = '("2016"[pdat] : "3000"[pdat])';

  const parts = [
    `(${genePart})`,
    topicPart ? `(${topicPart})` : null,
    geneticsContext,
    publicationType,
    dateFilter,
  ].filter(Boolean);

  return parts.join(' AND ');
}

function buildFallbackQueries(genes: string[], topics: string[] | undefined): string[] {
  // Start strict, then progressively relax if we get no hits.
  const genePart = genes.map(g => `${g}[tiab]`).join(' OR ');
  const topicPart = (topics || []).map(t => `"${t.replace(/"/g, '')}"[tiab]`).join(' OR ');

  const geneticsContext = '(genetic[tiab] OR hereditary[tiab] OR variant[tiab] OR mutation[tiab])';
  const publicationType = '(review[pt] OR guideline[pt] OR meta-analysis[pt])';
  const reviewOnly = '(review[pt] OR meta-analysis[pt])';
  const dateFilter = '("2016"[pdat] : "3000"[pdat])';
  const widerDateFilter = '("2010"[pdat] : "3000"[pdat])';

  const q1 = buildPubMedQuery(genes, topics);
  const q2 = [ `(${genePart})`, geneticsContext, publicationType, dateFilter ].join(' AND '); // drop topic
  const q3 = [ `(${genePart})`, publicationType, dateFilter ].join(' AND '); // drop geneticsContext
  const q4 = [ `(${genePart})`, reviewOnly, widerDateFilter ].join(' AND '); // wider years, still review-ish
  const q5 = topicPart
    ? [ `(${genePart})`, `(${topicPart})`, widerDateFilter ].join(' AND ') // allow non-review if topic is specific
    : [ `(${genePart})`, widerDateFilter ].join(' AND ');

  // De-dupe while preserving order
  const seen = new Set<string>();
  const queries: string[] = [];
  for (const q of [q1, q2, q3, q4, q5]) {
    if (!seen.has(q)) {
      seen.add(q);
      queries.push(q);
    }
  }
  return queries;
}

async function pubmedESearch(term: string, retmax: number): Promise<string[]> {
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  const url = new URL(base);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('retmax', String(retmax));
  url.searchParams.set('sort', 'relevance');
  url.searchParams.set('term', term);
  url.searchParams.set('tool', 'mydna-explainer');
  if (process.env.NCBI_API_KEY) url.searchParams.set('api_key', process.env.NCBI_API_KEY);

  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`PubMed search failed (${res.status})`);

  const json = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  const ids: string[] = json?.esearchresult?.idlist || [];
  return Array.isArray(ids) ? ids : [];
}

async function pubmedESummary(
  pmids: string[],
  context: { genes: string[]; topics?: string[] }
): Promise<LiteratureArticle[]> {
  if (pmids.length === 0) return [];

  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
  const url = new URL(base);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('id', pmids.join(','));
  url.searchParams.set('tool', 'mydna-explainer');
  if (process.env.NCBI_API_KEY) url.searchParams.set('api_key', process.env.NCBI_API_KEY);

  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`PubMed summary failed (${res.status})`);

  interface PubMedAuthor { name?: string }
  interface PubMedArticle {
    uid?: string;
    title?: string;
    fulljournalname?: string;
    source?: string;
    pubdate?: string;
    authors?: PubMedAuthor[];
  }
  interface PubMedResponse {
    result?: {
      uids?: string[];
      [key: string]: unknown;
    };
  }

  const json = (await res.json()) as PubMedResponse;
  const result = json?.result;
  const uids: string[] = result?.uids || [];
  if (!Array.isArray(uids)) return [];

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const buildWhyRelevant = (title: string, genes: string[], topics?: string[]): string => {
    const matchedGenes = genes.filter((g) => new RegExp(`\\b${escapeRegex(g)}\\b`, 'i').test(title));
    const matchedTopics = (topics || []).filter((t) => title.toLowerCase().includes(t.toLowerCase()));

    const parts: string[] = [];
    if (matchedGenes.length > 0) parts.push(`Matches gene${matchedGenes.length > 1 ? 's' : ''}: ${matchedGenes.join(', ')}`);
    if (matchedTopics.length > 0) parts.push(`Matches topic${matchedTopics.length > 1 ? 's' : ''}: ${matchedTopics.join(', ')}`);

    if (parts.length === 0) {
      return 'Suggested review/guideline-style background reading related to your detected gene/topic keywords (PubMed).';
    }
    return `${parts.join(' · ')}. Suggested review/guideline-style background reading (PubMed).`;
  };

  const articles: LiteratureArticle[] = [];
  for (const uid of uids) {
    const rawItem = result?.[uid];
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) continue;
    const it = rawItem as PubMedArticle;

    const title: string | undefined = it?.title;
    if (!title || typeof title !== 'string') continue;

    const journal: string | undefined = it?.fulljournalname || it?.source;
    const pubdate: string | undefined = it?.pubdate;
    const year = typeof pubdate === 'string' ? (pubdate.match(/\b(19|20)\d{2}\b/)?.[0]) : undefined;
    const authors =
      Array.isArray(it?.authors) ? it.authors.map((a) => a?.name).filter(Boolean).join(', ') : undefined;

    const pmid = String(it?.uid || uid);
    const urlStr = `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`;

    // Derive a simple “why relevant” from the title only (privacy-safe).
    // Note: we only use the paper title + user-selected gene/topic keywords (not report text).
    const whyRelevant = buildWhyRelevant(title, context.genes.map(g => g.toUpperCase()), context.topics);

    articles.push({
      title,
      pmid,
      journal: typeof journal === 'string' ? journal : undefined,
      year,
      authors: typeof authors === 'string' && authors.length > 0 ? authors : undefined,
      url: urlStr,
      why_relevant: whyRelevant,
    });
  }

  return articles;
}

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting (best-effort, per-instance)
    const ip = getClientIp(request);
    const limitPerMin = Number(process.env.RATE_LIMIT_LITERATURE_PER_MIN || 30);
    const rl = rateLimit(`literature:${ip}`, { windowMs: 60_000, max: Math.max(1, limitPerMin) });
    if (!rl.allowed) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please wait a bit and try again.',
        },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(Math.ceil(rl.resetMs / 1000)),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    let validated: ReturnType<typeof validateLiteratureRequest>;
    try {
      validated = validateLiteratureRequest(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Validation failed', details: error.errors.map(e => e.message).join(', ') },
          { status: 400 }
        );
      }
      throw error;
    }

    const genes = validated.genes.map(g => g.trim()).filter(Boolean);
    const topics = validated.topics?.map(t => t.trim()).filter(Boolean);
    const maxResults = validated.max_results ?? 5;

    const queryAttempts = buildFallbackQueries(genes, topics);
    const cacheKey = buildCacheKey({ genes, topics, max_results: maxResults });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
        },
      });
    }

    let usedQuery = queryAttempts[0];
    let pmids: string[] = [];
    for (const q of queryAttempts) {
      usedQuery = q;
      pmids = await pubmedESearch(q, maxResults);
      if (pmids.length > 0) break;
    }
    const articles = await pubmedESummary(pmids, { genes, topics });

    const response: LiteratureResponse = {
      query: usedQuery,
      articles,
      disclaimer:
        'Suggested reading only. These links are provided for education and are not medical advice. ' +
        'This search uses only the selected gene/topic keywords (not your full report text).' +
        (usedQuery !== queryAttempts[0] ? ' Search was broadened to find results.' : ''),
    };

    cache.set(cacheKey, { ts: Date.now(), data: response });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
      },
    });
  } catch (error) {
    console.error('Literature API error:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Failed to fetch literature',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

