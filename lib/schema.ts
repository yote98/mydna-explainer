import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

// Translate API request
// Note: keep this reasonably low for privacy + cost control.
export const translateRequestSchema = z.object({
  text: z.string()
    .min(10, 'Report text must be at least 10 characters')
    .max(50000, 'Report text must not exceed 50,000 characters'),
  // Optional: allow client to request prebuilt-only mode (UI toggle in dev).
  mode: z.enum(['auto', 'prebuilt_only']).optional(),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

// ClinVar lookup request
export const clinvarRequestSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(500, 'Query must not exceed 500 characters'),
});

export type ClinvarRequest = z.infer<typeof clinvarRequestSchema>;

// Literature search request (PubMed / Europe PMC)
export const literatureRequestSchema = z.object({
  genes: z.array(z.string().min(2).max(20)).min(1).max(3),
  topics: z.array(z.string().min(2).max(80)).max(3).optional(),
  max_results: z.number().int().min(1).max(10).optional(),
});

export type LiteratureRequest = z.infer<typeof literatureRequestSchema>;

// ============================================================================
// Entity Schemas (extracted from reports)
// ============================================================================

export const entityTypeSchema = z.enum([
  'gene',
  'rsid',
  'hgvs',
  'variant_classification',
  'zygosity',
  'condition',
  'unknown'
]);

export const extractedEntitySchema = z.object({
  type: entityTypeSchema,
  value: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

export type ExtractedEntity = z.infer<typeof extractedEntitySchema>;

// ============================================================================
// Glossary Schemas
// ============================================================================

export const glossaryEntrySchema = z.object({
  term: z.string(),
  meaning: z.string(),
  why_it_matters: z.string(),
  common_misreadings: z.array(z.string()).optional(),
});

export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;

// ============================================================================
// Next Steps Schemas
// ============================================================================

export const urgencyLevelSchema = z.enum([
  'routine',       // Normal follow-up timeline
  'soon',          // Within a few weeks
  'important',     // Should prioritize
  'informational'  // No urgency, just FYI
]);

export const nextStepSchema = z.object({
  title: z.string(),
  rationale: z.string(),
  who_to_talk_to: z.string(),
  urgency: urgencyLevelSchema,
});

export type NextStep = z.infer<typeof nextStepSchema>;

// ============================================================================
// Source/Citation Schemas
// ============================================================================

export const sourceSchema = z.object({
  label: z.string(),
  url: z.string().url().optional(),
  why_relevant: z.string(),
});

export type Source = z.infer<typeof sourceSchema>;

// ============================================================================
// Literature Response Schemas
// ============================================================================

export const literatureArticleSchema = z.object({
  title: z.string(),
  pmid: z.string().optional(),
  journal: z.string().optional(),
  year: z.string().optional(),
  authors: z.string().optional(),
  url: z.string().url(),
  why_relevant: z.string(),
});

export type LiteratureArticle = z.infer<typeof literatureArticleSchema>;

export const literatureResponseSchema = z.object({
  query: z.string(),
  articles: z.array(literatureArticleSchema),
  disclaimer: z.string(),
});

export type LiteratureResponse = z.infer<typeof literatureResponseSchema>;

// ============================================================================
// Refusal Schemas (for handling disallowed requests)
// ============================================================================

export const refusalSchema = z.object({
  user_intent: z.string(),
  refusal_text: z.string(),
  safe_alternative: z.string(),
});

export type Refusal = z.infer<typeof refusalSchema>;

// ============================================================================
// Main Translation Response Schema
// ============================================================================

export const translateResponseSchema = z.object({
  disclaimer: z.string(),
  extracted_entities: z.array(extractedEntitySchema),
  summary_plain_english: z.string(),
  glossary: z.array(glossaryEntrySchema),
  what_this_does_not_mean: z.array(z.string()),
  next_steps: z.array(nextStepSchema),
  questions_to_ask: z.array(z.string()),
  sources: z.array(sourceSchema),
  refusals: z.array(refusalSchema),
});

export type TranslateResponse = z.infer<typeof translateResponseSchema>;

// ============================================================================
// ClinVar Response Schemas
// ============================================================================

export const clinicalSignificanceSchema = z.enum([
  'Pathogenic',
  'Likely pathogenic',
  'Uncertain significance',
  'Likely benign',
  'Benign',
  'Conflicting interpretations',
  'Not provided',
  'Other'
]);

export const reviewStatusSchema = z.enum([
  'practice guideline',
  'reviewed by expert panel',
  'criteria provided, multiple submitters, no conflicts',
  'criteria provided, conflicting interpretations',
  'criteria provided, single submitter',
  'no assertion for the individual variant',
  'no assertion criteria provided',
  'no assertion provided'
]);

export const clinvarVariantSchema = z.object({
  variation_id: z.string(),
  name: z.string(),
  gene_symbol: z.string().optional(),
  clinical_significance: clinicalSignificanceSchema,
  review_status: reviewStatusSchema,
  conditions: z.array(z.string()),
  last_evaluated: z.string().optional(),
  submissions_count: z.number().optional(),
  source_url: z.string().url(),
});

export type ClinvarVariant = z.infer<typeof clinvarVariantSchema>;

export const clinvarResponseSchema = z.object({
  query: z.string(),
  found: z.boolean(),
  variant: clinvarVariantSchema.optional(),
  interpretation_guide: z.string(),
  disclaimer: z.string(),
  error: z.string().optional(),
});

export type ClinvarResponse = z.infer<typeof clinvarResponseSchema>;

// ============================================================================
// Error Response Schema
// ============================================================================

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateTranslateRequest(data: unknown): TranslateRequest {
  return translateRequestSchema.parse(data);
}

export function validateClinvarRequest(data: unknown): ClinvarRequest {
  return clinvarRequestSchema.parse(data);
}

export function validateLiteratureRequest(data: unknown): LiteratureRequest {
  return literatureRequestSchema.parse(data);
}

export function validateTranslateResponse(data: unknown): TranslateResponse {
  return translateResponseSchema.parse(data);
}

export function safeValidateTranslateResponse(data: unknown): { 
  success: boolean; 
  data?: TranslateResponse; 
  error?: z.ZodError 
} {
  const result = translateResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// ============================================================================
// rsID and HGVS Detection Patterns
// ============================================================================

// rsID pattern: rs followed by numbers (e.g., rs1234567)
export const rsIdPattern = /\brs\d+\b/gi;

// HGVS patterns (simplified - covers common formats)
// e.g., NM_000123.4:c.123A>G, NC_000001.11:g.12345A>G
export const hgvsPattern = /\b(NM_|NC_|NP_|NG_)\d+\.\d+:[cgpnmr]\.\d+[A-Z>_\-\d]+/gi;

// Gene symbol pattern (simplified - common format)
export const genePattern = /\b[A-Z][A-Z0-9]{1,10}\b/g;

// Extract identifiers from text
export function extractIdentifiers(text: string): {
  rsIds: string[];
  hgvsNotations: string[];
  possibleGenes: string[];
} {
  const rsIds = [...new Set(text.match(rsIdPattern) || [])];
  const hgvsNotations = [...new Set(text.match(hgvsPattern) || [])];
  
  // For genes, we need to be more careful - many false positives
  // Only include if they appear near genetics-related context
  const possibleGenes: string[] = [];
  const geneMatches = text.match(genePattern) || [];
  const geneticsKeywords = ['gene', 'variant', 'mutation', 'pathogenic', 'benign', 'vus', 'heterozygous', 'homozygous'];
  
  for (const match of geneMatches) {
    // Skip common false positives
    if (['THE', 'AND', 'FOR', 'NOT', 'VUS', 'DNA', 'RNA'].includes(match)) continue;
    
    // Check if it appears near genetics context
    const contextRegex = new RegExp(`(${geneticsKeywords.join('|')}).{0,50}${match}|${match}.{0,50}(${geneticsKeywords.join('|')})`, 'i');
    if (contextRegex.test(text)) {
      possibleGenes.push(match);
    }
  }
  
  return {
    rsIds,
    hgvsNotations,
    possibleGenes: [...new Set(possibleGenes)]
  };
}
