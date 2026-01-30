import { readFileSync } from 'fs';
import { join } from 'path';
import { TranslateResponse } from './schema';
import { getDisclaimer } from './kb';

// Types for pre-built responses
interface GeneResponse {
  summary: string;
  what_this_means?: string[];
  what_this_does_not_mean?: string[];
  next_steps?: Array<{
    title: string;
    description: string;
    urgency: string;
  }>;
  questions_to_ask?: string[];
  caution?: string;
}

interface GeneData {
  full_name: string;
  description: string;
  associated_conditions?: string[];
  inheritance?: string;
  penetrance?: string;
  important_context?: string;
  responses: Record<string, GeneResponse>;
}

interface PrebuiltData {
  genes: Record<string, GeneData>;
  common_classifications: Record<string, {
    standard_response: {
      summary: string;
      key_points: string[];
      recommendation?: string;
    };
  }>;
}

// Cache for loaded data
let prebuiltCache: PrebuiltData | null = null;

function safeReadJson<T>(filePath: string): T | null {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadPrebuiltData(): PrebuiltData {
  if (prebuiltCache) return prebuiltCache;
  
  try {
    const basePath = join(process.cwd(), 'kb', 'prebuilt', 'common-genes.json');
    const base = safeReadJson<PrebuiltData>(basePath) || { genes: {}, common_classifications: {} };

    // Optional extension file to keep the base file small and stable.
    // Add more genes here without touching the original starter dataset.
    const extendedPath = join(process.cwd(), 'kb', 'prebuilt', 'extended-genes.json');
    const extended = safeReadJson<Partial<PrebuiltData>>(extendedPath);

    prebuiltCache = {
      genes: {
        ...(base.genes || {}),
        ...(extended?.genes || {}),
      },
      common_classifications: {
        ...(base.common_classifications || {}),
        ...(extended?.common_classifications || {}),
      },
    };
    return prebuiltCache;
  } catch (error) {
    console.error('Failed to load prebuilt responses:', error);
    return { genes: {}, common_classifications: {} };
  }
}

function escapeRegexLiteral(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Optional synonyms for a few common “non-gene-symbol” names users paste.
const GENE_SYNONYMS: Record<string, string[]> = {
  'Factor V Leiden': ['Factor V Leiden', 'F5', 'FVL'],
};

function buildGeneRegex(geneName: string): RegExp {
  // Most gene symbols are like BRCA1, HNF1A, etc.
  if (/^[A-Z0-9]{2,12}$/.test(geneName)) {
    return new RegExp(`\\b${escapeRegexLiteral(geneName)}\\b`, 'i');
  }

  // Names with spaces (e.g., Factor V Leiden)
  const synonyms = GENE_SYNONYMS[geneName] || [geneName];
  const alts = synonyms.map((s) => {
    const parts = s.trim().split(/\s+/).map(escapeRegexLiteral);
    return parts.length > 1 ? parts.join('\\s*') : parts[0];
  });
  return new RegExp(`\\b(?:${alts.join('|')})\\b`, 'i');
}

let genePatternsCache: Record<string, RegExp> | null = null;
function getGenePatterns(): Record<string, RegExp> {
  if (genePatternsCache) return genePatternsCache;
  const data = loadPrebuiltData();
  const patterns: Record<string, RegExp> = {};
  for (const geneName of Object.keys(data.genes || {})) {
    patterns[geneName] = buildGeneRegex(geneName);
  }
  genePatternsCache = patterns;
  return genePatternsCache;
}

const CLASSIFICATION_PATTERNS = {
  pathogenic: /\b(pathogenic|disease[- ]causing)\b/i,
  likely_pathogenic: /\blikely\s*pathogenic\b/i,
  vus: /\b(VUS|variant\s*of\s*uncertain\s*significance|uncertain\s*significance)\b/i,
  likely_benign: /\blikely\s*benign\b/i,
  benign: /\bbenign\b/i,
  carrier: /\bcarrier\b/i,
};

const APOE_PATTERNS = {
  e4: /\b(APOE\s*)?[eε]4|e4\/e4|e3\/e4|e4\/e3\b/i,
  e2: /\b(APOE\s*)?[eε]2\b/i,
};

const FACTOR_V_PATTERNS = {
  homozygous: /\bhomozygous\b/i,
  heterozygous: /\bheterozygous\b/i,
};

export interface PrebuiltMatch {
  gene: string;
  classification: string;
  confidence: 'high' | 'medium' | 'low';
  detected_genes?: string[];
}

/**
 * Check if the report text matches any pre-built response patterns
 */
export function findPrebuiltMatch(text: string): PrebuiltMatch | null {
  const data = loadPrebuiltData();
  const hasGeneticContext = /\b(gene|variant|rs\d+|hgvs|zygosity|genotype|allele|clinvar)\b/i.test(text);

  // 0) CircleDNA-style panel detection (no variant, just “Tested gene(s): ...”)
  // Example: "Tested gene(s): HNF1A, GCKR, LEPR"
  const panelMatch = text.match(/\bTested\s*gene\(s\)?\s*:\s*([A-Z0-9,\s-]{6,})/i);
  if (panelMatch) {
    const raw = panelMatch[1];
    const genes = raw
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => /^[A-Z0-9-]{2,15}$/.test(s));

    const supported = genes.filter((g) => Boolean(data.genes[g]));
    // Only use prebuilt if we recognize at least one gene and no explicit classification is present.
    const hasClassification =
      CLASSIFICATION_PATTERNS.pathogenic.test(text) ||
      CLASSIFICATION_PATTERNS.likely_pathogenic.test(text) ||
      CLASSIFICATION_PATTERNS.vus.test(text) ||
      CLASSIFICATION_PATTERNS.likely_benign.test(text) ||
      CLASSIFICATION_PATTERNS.benign.test(text);

    if (supported.length > 0 && !hasClassification) {
      return { gene: 'panel', classification: 'gene_panel', confidence: 'high', detected_genes: supported };
    }
  }
  
  // Check for each known gene
  for (const [geneName, pattern] of Object.entries(getGenePatterns())) {
    if (pattern.test(text)) {
      const geneData = data.genes[geneName];
      // Found a gene, now determine classification
      let classification = 'general';
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      // Check for specific classifications
      if (CLASSIFICATION_PATTERNS.pathogenic.test(text) && !CLASSIFICATION_PATTERNS.likely_pathogenic.test(text)) {
        classification = 'pathogenic';
        confidence = 'high';
      } else if (CLASSIFICATION_PATTERNS.likely_pathogenic.test(text)) {
        classification = 'pathogenic'; // Treat similar to pathogenic
        confidence = 'high';
      } else if (CLASSIFICATION_PATTERNS.vus.test(text)) {
        classification = 'vus';
        confidence = 'high';
      } else if (CLASSIFICATION_PATTERNS.likely_benign.test(text)) {
        classification = 'benign';
        confidence = 'high';
      } else if (CLASSIFICATION_PATTERNS.benign.test(text)) {
        classification = 'benign';
        confidence = 'high';
      } else if (CLASSIFICATION_PATTERNS.carrier.test(text)) {
        classification = 'carrier';
        confidence = 'high';
      }
      
      // Special handling for APOE
      if (geneName === 'APOE' && APOE_PATTERNS.e4.test(text)) {
        classification = 'e4_carrier';
        confidence = 'high';
      }
      
      // Special handling for Factor V Leiden
      if (geneName === 'Factor V Leiden') {
        if (FACTOR_V_PATTERNS.homozygous.test(text)) {
          classification = 'homozygous';
          confidence = 'high';
        } else if (FACTOR_V_PATTERNS.heterozygous.test(text)) {
          classification = 'heterozygous';
          confidence = 'high';
        }
      }
      
      // If "carrier" is mentioned but this gene doesn't have a carrier template,
      // don't let that block a match (fall back to general).
      if (classification === 'carrier' && geneData && !geneData.responses?.carrier) {
        classification = 'general';
        confidence = 'medium';
      }

      // If we detected a classification but don't have a template for it,
      // fall back to a general template when available (better than no prebuilt hit).
      if (geneData && !geneData.responses?.[classification] && geneData.responses?.general) {
        classification = 'general';
        confidence = confidence === 'high' ? 'medium' : confidence;
      }

      // Check if we have a pre-built response for this combination
      if (geneData && geneData.responses[classification]) {
        return { gene: geneName, classification, confidence };
      }
    }
  }
  
  // Check for classification-only matches.
  // IMPORTANT: require obvious genetic context to avoid false positives (e.g., “benign tumor”).
  if (hasGeneticContext) {
    if (CLASSIFICATION_PATTERNS.vus.test(text)) {
      return { gene: 'unknown', classification: 'VUS', confidence: 'high' };
    }

    if (CLASSIFICATION_PATTERNS.likely_pathogenic.test(text)) {
      return { gene: 'unknown', classification: 'Likely Pathogenic', confidence: 'medium' };
    }

    if (CLASSIFICATION_PATTERNS.pathogenic.test(text)) {
      return { gene: 'unknown', classification: 'Pathogenic', confidence: 'medium' };
    }

    if (CLASSIFICATION_PATTERNS.likely_benign.test(text)) {
      return { gene: 'unknown', classification: 'Likely Benign', confidence: 'medium' };
    }

    if (CLASSIFICATION_PATTERNS.benign.test(text)) {
      return { gene: 'unknown', classification: 'Benign', confidence: 'medium' };
    }
  }
  
  return null;
}

/**
 * Generate a TranslateResponse from pre-built data
 */
export function generatePrebuiltResponse(
  match: PrebuiltMatch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  originalText: string
): TranslateResponse {
  const data = loadPrebuiltData();
  
  // Handle VUS in unknown gene
  if (match.gene === 'unknown' && match.classification === 'VUS') {
    const vusData = data.common_classifications['VUS'];
    return {
      disclaimer: getDisclaimer(),
      extracted_entities: [
        {
          type: 'variant_classification',
          value: 'VUS (Variant of Uncertain Significance)',
          confidence: 'high',
        }
      ],
      summary_plain_english: vusData.standard_response.summary,
      glossary: [
        {
          term: 'VUS',
          meaning: 'Variant of Uncertain Significance - a genetic change whose impact is not yet known',
          why_it_matters: 'Most VUS are eventually reclassified as benign (harmless)',
        }
      ],
      what_this_does_not_mean: vusData.standard_response.key_points,
      next_steps: [
        {
          title: 'Consult a Genetic Counselor',
          rationale: vusData.standard_response.recommendation || 'A genetic counselor can explain what this means for you',
          who_to_talk_to: 'Certified Genetic Counselor',
          urgency: 'routine',
        }
      ],
      questions_to_ask: [
        'What does this VUS mean for my specific situation?',
        'Should my medical care change based on this finding?',
        'How will I know if this variant is reclassified in the future?',
      ],
      sources: [
        {
          label: 'ClinVar Database',
          url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
          why_relevant: 'Check for updated variant classifications',
        },
        {
          label: 'Find a Genetic Counselor',
          url: 'https://www.nsgc.org/findageneticcounselor',
          why_relevant: 'Professional guidance on genetic results',
        }
      ],
      refusals: [],
    };
  }

  // Handle generic classifications (unknown gene)
  if (match.gene === 'unknown' && data.common_classifications[match.classification]) {
    const cls = data.common_classifications[match.classification].standard_response;
    return {
      disclaimer: getDisclaimer(),
      extracted_entities: [
        {
          type: 'variant_classification',
          value: match.classification,
          confidence: 'medium',
        }
      ],
      summary_plain_english: cls.summary,
      glossary: [],
      what_this_does_not_mean: cls.key_points,
      next_steps: cls.recommendation
        ? [
            {
              title: 'Discuss with a professional',
              rationale: cls.recommendation,
              who_to_talk_to: 'Healthcare Provider or Genetic Counselor',
              urgency: 'routine',
            }
          ]
        : [],
      questions_to_ask: [],
      sources: [
        {
          label: 'ClinVar Database',
          url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
          why_relevant: 'Learn about variant classifications and how they can change over time',
        }
      ],
      refusals: [],
    };
  }

  // Handle gene panels (CircleDNA-style “tested gene(s)” output)
  if (match.gene === 'panel' && match.classification === 'gene_panel') {
    const genes = match.detected_genes || [];
    return {
      disclaimer: getDisclaimer(),
      extracted_entities: [
        ...genes.map((g) => ({
          type: 'gene' as const,
          value: g,
          confidence: 'high' as const,
        })),
        {
          type: 'unknown',
          value: 'Gene panel (tested genes listed)',
          confidence: 'medium',
        }
      ],
      summary_plain_english:
        `This section lists genes that were analyzed as part of a panel (for example, to explore a health topic). ` +
        `A list of tested genes is not the same as a positive finding. If your report does not state a specific variant and classification, ` +
        `it may simply be describing what was evaluated.\n\n` +
        (genes.length > 0 ? `Genes detected: ${genes.join(', ')}.` : ''),
      glossary: [
        {
          term: 'Gene panel',
          meaning: 'A set of genes analyzed together around a theme (for example, cancer predisposition, carrier screening, or metabolism).',
          why_it_matters: 'Panels can include many genes; interpretation depends on the specific variants (if any) and their classifications.',
        }
      ],
      what_this_does_not_mean: [
        'A gene being listed as “tested” does NOT mean you have a harmful variant in that gene',
        'You should not make medical decisions based on a list of tested genes alone',
      ],
      next_steps: [
        {
          title: 'Look for variant details',
          rationale: 'If the report has a meaningful finding, it usually lists a specific variant identifier and a classification (for example: pathogenic, VUS, benign).',
          who_to_talk_to: 'You (review the report) or a Genetic Counselor',
          urgency: 'informational',
        }
      ],
      questions_to_ask: [
        'Does this report list any specific variants and classifications, or only a list of tested genes?',
        'If a variant is listed, what is its classification and evidence level?',
      ],
      sources: [
        {
          label: 'ClinVar Database',
          url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
          why_relevant: 'Public database for variant classifications and supporting evidence',
        }
      ],
      refusals: [],
    };
  }
  
  // Get gene-specific response
  const geneData = data.genes[match.gene];
  const response = geneData?.responses[match.classification];
  
  if (!geneData || !response) {
    throw new Error('Pre-built response not found');
  }
  
  // Build the response
  const result: TranslateResponse = {
    disclaimer: getDisclaimer(),
    extracted_entities: [
      {
        type: 'gene',
        value: match.gene,
        confidence: 'high',
        notes: geneData.full_name,
      },
    ],
    summary_plain_english: response.summary + (geneData.important_context ? `\n\n**Important Context**: ${geneData.important_context}` : ''),
    glossary: [
      {
        term: match.gene,
        meaning: geneData.description,
        why_it_matters: geneData.associated_conditions ? `Associated with: ${geneData.associated_conditions.join(', ')}` : 'This gene is relevant to your health',
      }
    ],
    what_this_does_not_mean: response.what_this_does_not_mean || [],
    next_steps: (response.next_steps || []).map(step => ({
      title: step.title,
      rationale: step.description,
      who_to_talk_to: step.title.includes('Genetic') ? 'Certified Genetic Counselor' : 'Healthcare Provider',
      urgency: step.urgency as 'routine' | 'soon' | 'important' | 'informational',
    })),
    questions_to_ask: response.questions_to_ask || [],
    sources: [
      {
        label: 'ClinVar Database',
        url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
        why_relevant: 'Look up variant classifications and evidence',
      },
      {
        label: 'Find a Genetic Counselor',
        url: 'https://www.nsgc.org/findageneticcounselor',
        why_relevant: 'Get professional guidance on your results',
      },
      {
        label: 'GeneReviews',
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK1116/',
        why_relevant: 'Detailed information about genetic conditions',
      }
    ],
    refusals: [],
  };

  // Only include a classification entity when we have a meaningful classification.
  if (match.classification && match.classification !== 'general') {
    result.extracted_entities.push({
      type: 'variant_classification',
      value: match.classification,
      confidence: match.confidence,
    });
  }
  
  // Add caution if present
  if (response.caution) {
    result.what_this_does_not_mean.push(`CAUTION: ${response.caution}`);
  }
  
  // Add inheritance and penetrance info to glossary if available
  if (geneData.inheritance) {
    result.glossary.push({
      term: 'Inheritance Pattern',
      meaning: geneData.inheritance,
      why_it_matters: 'This affects how the variant may be passed to family members',
    });
  }
  
  if (geneData.penetrance) {
    result.glossary.push({
      term: 'Penetrance',
      meaning: geneData.penetrance,
      why_it_matters: 'This indicates the likelihood of developing symptoms if you carry the variant',
    });
  }
  
  return result;
}

/**
 * Check if we can use a pre-built response for this text
 */
export function canUsePrebuiltResponse(text: string): boolean {
  return findPrebuiltMatch(text) !== null;
}

/**
 * Get a list of genes we have pre-built responses for
 */
export function getSupportedGenes(): string[] {
  const data = loadPrebuiltData();
  return Object.keys(data.genes);
}
