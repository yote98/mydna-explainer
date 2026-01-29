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

function loadPrebuiltData(): PrebuiltData {
  if (prebuiltCache) return prebuiltCache;
  
  try {
    const filePath = join(process.cwd(), 'kb', 'prebuilt', 'common-genes.json');
    const data = readFileSync(filePath, 'utf-8');
    prebuiltCache = JSON.parse(data) as PrebuiltData;
    return prebuiltCache;
  } catch (error) {
    console.error('Failed to load prebuilt responses:', error);
    return { genes: {}, common_classifications: {} };
  }
}

// Patterns to detect genes and classifications
const GENE_PATTERNS: Record<string, RegExp> = {
  'BRCA1': /\bBRCA1\b/i,
  'BRCA2': /\bBRCA2\b/i,
  'APOE': /\bAPOE\b/i,
  'MTHFR': /\bMTHFR\b/i,
  'Factor V Leiden': /\b(Factor\s*V\s*Leiden|F5|FVL)\b/i,
};

const CLASSIFICATION_PATTERNS = {
  pathogenic: /\b(pathogenic|disease[- ]causing)\b/i,
  likely_pathogenic: /\blikely\s*pathogenic\b/i,
  vus: /\b(VUS|variant\s*of\s*uncertain\s*significance|uncertain\s*significance)\b/i,
  likely_benign: /\blikely\s*benign\b/i,
  benign: /\bbenign\b/i,
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
}

/**
 * Check if the report text matches any pre-built response patterns
 */
export function findPrebuiltMatch(text: string): PrebuiltMatch | null {
  const data = loadPrebuiltData();
  
  // Check for each known gene
  for (const [geneName, pattern] of Object.entries(GENE_PATTERNS)) {
    if (pattern.test(text)) {
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
      
      // Check if we have a pre-built response for this combination
      const geneData = data.genes[geneName];
      if (geneData && geneData.responses[classification]) {
        return { gene: geneName, classification, confidence };
      }
    }
  }
  
  // Check for classification-only matches (VUS in any gene)
  if (CLASSIFICATION_PATTERNS.vus.test(text)) {
    return { gene: 'unknown', classification: 'VUS', confidence: 'medium' };
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
      {
        type: 'variant_classification',
        value: match.classification,
        confidence: match.confidence,
      }
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
