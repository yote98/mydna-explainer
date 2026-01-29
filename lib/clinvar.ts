import { ClinvarVariant, ClinvarResponse } from './schema';
import { clinvarCache, ncbiRateLimiter } from './cache';
import { getDisclaimer } from './kb';

// ============================================================================
// Configuration
// ============================================================================

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const CLINVAR_BASE_URL = 'https://www.ncbi.nlm.nih.gov/clinvar';

function getApiKeyParam(): string {
  const apiKey = process.env.NCBI_API_KEY;
  return apiKey ? `&api_key=${apiKey}` : '';
}

// ============================================================================
// Types for NCBI API Responses
// ============================================================================

interface ESearchResult {
  esearchresult: {
    count: string;
    idlist: string[];
    errorlist?: {
      phrasesnotfound?: string[];
    };
  };
}

interface ESummaryResult {
  result: {
    uids: string[];
    [uid: string]: unknown;
  };
}

interface ClinVarSummary {
  uid: string;
  title: string;
  clinical_significance?: {
    description: string;
    last_evaluated?: string;
    review_status?: string;
  };
  genes?: Array<{ symbol: string }>;
  trait_set?: Array<{ trait_name: string }>;
  variation_set?: Array<{
    variation_name: string;
    cdna_change?: string;
  }>;
  accession?: string;
  supporting_submissions?: {
    scv?: string[];
  };
}

// ============================================================================
// Query Type Detection
// ============================================================================

type QueryType = 'rsid' | 'hgvs' | 'variation_id' | 'gene' | 'unknown';

function detectQueryType(query: string): QueryType {
  const trimmed = query.trim();
  
  // rsID: rs followed by numbers
  if (/^rs\d+$/i.test(trimmed)) {
    return 'rsid';
  }
  
  // ClinVar Variation ID: VCV or just numbers
  if (/^(VCV)?\d+$/i.test(trimmed)) {
    return 'variation_id';
  }
  
  // HGVS notation
  if (/^(NM_|NC_|NP_|NG_)/i.test(trimmed)) {
    return 'hgvs';
  }
  
  // Could be a gene symbol
  if (/^[A-Z][A-Z0-9]{1,10}$/i.test(trimmed)) {
    return 'gene';
  }
  
  return 'unknown';
}

// ============================================================================
// NCBI API Calls
// ============================================================================

async function searchClinVar(query: string, queryType: QueryType): Promise<string[]> {
  await ncbiRateLimiter.waitForSlot();
  ncbiRateLimiter.recordRequest();
  
  let searchTerm: string;
  
  switch (queryType) {
    case 'rsid':
      searchTerm = `${query}[Variant ID]`;
      break;
    case 'variation_id':
      // Remove VCV prefix if present
      const varId = query.replace(/^VCV/i, '');
      searchTerm = `${varId}[Variation ID]`;
      break;
    case 'hgvs':
      searchTerm = `"${query}"[Variant name]`;
      break;
    case 'gene':
      searchTerm = `${query}[Gene Name]`;
      break;
    default:
      searchTerm = query;
  }
  
  const url = `${NCBI_BASE_URL}/esearch.fcgi?db=clinvar&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=5${getApiKeyParam()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`ClinVar search failed: ${response.status}`);
  }
  
  const data = await response.json() as ESearchResult;
  
  return data.esearchresult.idlist || [];
}

async function getClinVarSummary(uids: string[]): Promise<ClinVarSummary[]> {
  if (uids.length === 0) return [];
  
  await ncbiRateLimiter.waitForSlot();
  ncbiRateLimiter.recordRequest();
  
  const url = `${NCBI_BASE_URL}/esummary.fcgi?db=clinvar&id=${uids.join(',')}&retmode=json${getApiKeyParam()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`ClinVar summary failed: ${response.status}`);
  }
  
  const data = await response.json() as ESummaryResult;
  
  const summaries: ClinVarSummary[] = [];
  
  for (const uid of data.result.uids || []) {
    const entry = data.result[uid] as ClinVarSummary | undefined;
    if (entry) {
      summaries.push({ ...entry, uid });
    }
  }
  
  return summaries;
}

// ============================================================================
// Response Normalization
// ============================================================================

function normalizeSignificance(significance: string | undefined): ClinvarVariant['clinical_significance'] {
  if (!significance) return 'Not provided';
  
  const lower = significance.toLowerCase();
  
  if (lower.includes('pathogenic') && !lower.includes('likely')) {
    return 'Pathogenic';
  }
  if (lower.includes('likely pathogenic')) {
    return 'Likely pathogenic';
  }
  if (lower.includes('uncertain') || lower.includes('vus')) {
    return 'Uncertain significance';
  }
  if (lower.includes('likely benign')) {
    return 'Likely benign';
  }
  if (lower.includes('benign') && !lower.includes('likely')) {
    return 'Benign';
  }
  if (lower.includes('conflicting')) {
    return 'Conflicting interpretations';
  }
  
  return 'Other';
}

function normalizeReviewStatus(status: string | undefined): ClinvarVariant['review_status'] {
  if (!status) return 'no assertion provided';
  
  const lower = status.toLowerCase();
  
  if (lower.includes('practice guideline')) {
    return 'practice guideline';
  }
  if (lower.includes('expert panel')) {
    return 'reviewed by expert panel';
  }
  if (lower.includes('multiple submitters') && lower.includes('no conflicts')) {
    return 'criteria provided, multiple submitters, no conflicts';
  }
  if (lower.includes('conflicting')) {
    return 'criteria provided, conflicting interpretations';
  }
  if (lower.includes('single submitter')) {
    return 'criteria provided, single submitter';
  }
  if (lower.includes('no assertion criteria')) {
    return 'no assertion criteria provided';
  }
  
  return 'no assertion provided';
}

function summaryToVariant(summary: ClinVarSummary): ClinvarVariant {
  const geneSymbol = summary.genes?.[0]?.symbol;
  const conditions = summary.trait_set?.map(t => t.trait_name) || [];
  
  return {
    variation_id: summary.uid,
    name: summary.title || 'Unknown variant',
    gene_symbol: geneSymbol,
    clinical_significance: normalizeSignificance(summary.clinical_significance?.description),
    review_status: normalizeReviewStatus(summary.clinical_significance?.review_status),
    conditions,
    last_evaluated: summary.clinical_significance?.last_evaluated,
    submissions_count: summary.supporting_submissions?.scv?.length,
    source_url: `${CLINVAR_BASE_URL}/variation/${summary.uid}`,
  };
}

// ============================================================================
// Interpretation Guide
// ============================================================================

function getInterpretationGuide(variant: ClinvarVariant | undefined): string {
  if (!variant) {
    return `No variant found matching your query. This could mean:
• The variant hasn't been submitted to ClinVar
• The query format wasn't recognized
• The variant exists under a different identifier

Try searching with a different identifier format (rsID, HGVS notation, or ClinVar variation ID).`;
  }
  
  const significance = variant.clinical_significance;
  
  const guides: Record<string, string> = {
    'Pathogenic': `This variant is classified as PATHOGENIC, meaning there is strong evidence it is associated with disease. However:
• This does NOT mean you will definitely develop the condition
• Risk depends on penetrance (not all carriers develop symptoms)
• Family history and other factors affect individual risk
• Discuss with a genetic counselor for personalized interpretation`,

    'Likely pathogenic': `This variant is classified as LIKELY PATHOGENIC (>90% certainty of disease association). This is treated clinically similar to pathogenic variants, but:
• Classification may change as more evidence emerges
• Individual risk varies based on many factors
• Consult a genetic counselor for guidance`,

    'Uncertain significance': `This variant is classified as VUS (Variant of Uncertain Significance). This means:
• NOT enough evidence to determine if it's harmful or harmless
• VUS is NOT a diagnosis
• Most VUS are eventually reclassified as benign
• Do NOT make medical decisions based on a VUS alone
• Consider periodic re-evaluation as classifications update`,

    'Likely benign': `This variant is classified as LIKELY BENIGN (>90% certainty it's harmless). Generally, no clinical action is needed.`,

    'Benign': `This variant is classified as BENIGN - it is not associated with disease. This is normal human variation.`,

    'Conflicting interpretations': `Different laboratories have submitted conflicting interpretations for this variant. This means:
• The evidence is not yet conclusive
• Treat with caution - do not make decisions based solely on this
• A genetic counselor can help interpret in your specific context`,
  };
  
  return guides[significance] || `This variant has a classification of "${significance}". Discuss with a healthcare provider for interpretation.`;
}

// ============================================================================
// Main Lookup Function
// ============================================================================

export async function lookupClinVar(query: string): Promise<ClinvarResponse> {
  const trimmedQuery = query.trim();
  
  // Check cache first
  const cacheKey = `clinvar:${trimmedQuery.toLowerCase()}`;
  const cached = clinvarCache.get<ClinvarResponse>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const queryType = detectQueryType(trimmedQuery);
  
  try {
    // Search for the variant
    const uids = await searchClinVar(trimmedQuery, queryType);
    
    if (uids.length === 0) {
      const response: ClinvarResponse = {
        query: trimmedQuery,
        found: false,
        interpretation_guide: getInterpretationGuide(undefined),
        disclaimer: getDisclaimer(),
      };
      
      clinvarCache.set(cacheKey, response);
      return response;
    }
    
    // Get summary for the first result
    const summaries = await getClinVarSummary([uids[0]]);
    
    if (summaries.length === 0) {
      const response: ClinvarResponse = {
        query: trimmedQuery,
        found: false,
        interpretation_guide: getInterpretationGuide(undefined),
        disclaimer: getDisclaimer(),
        error: 'Found variant ID but could not retrieve details',
      };
      
      clinvarCache.set(cacheKey, response);
      return response;
    }
    
    const variant = summaryToVariant(summaries[0]);
    
    const response: ClinvarResponse = {
      query: trimmedQuery,
      found: true,
      variant,
      interpretation_guide: getInterpretationGuide(variant),
      disclaimer: getDisclaimer(),
    };
    
    clinvarCache.set(cacheKey, response);
    return response;
    
  } catch (error) {
    console.error('ClinVar lookup error:', error);
    
    return {
      query: trimmedQuery,
      found: false,
      interpretation_guide: getInterpretationGuide(undefined),
      disclaimer: getDisclaimer(),
      error: error instanceof Error ? error.message : 'Failed to lookup variant',
    };
  }
}
