import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { TranslateResponse, translateResponseSchema, ExtractedEntity } from './schema';
import { getDisclaimer, buildGlossaryContext } from './kb';
import { findPrebuiltMatch, generatePrebuiltResponse } from './prebuilt-responses';

// ============================================================================
// Configuration
// ============================================================================

type LLMProvider = 'openai' | 'anthropic' | 'deepseek';

interface ProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

function getConfig(): ProviderConfig {
  const provider = (process.env.LLM_PROVIDER || 'deepseek') as LLMProvider;
  const apiKey = process.env.LLM_API_KEY;
  
  if (!apiKey) {
    throw new Error('LLM_API_KEY environment variable is required');
  }
  
  // Default models and base URLs for each provider
  const providerDefaults: Record<LLMProvider, { model: string; baseUrl?: string }> = {
    openai: { 
      model: 'gpt-4o' 
    },
    anthropic: { 
      model: 'claude-3-5-sonnet-20241022' 
    },
    deepseek: { 
      model: 'deepseek-chat', // DeepSeek-V3, excellent for medical reasoning
      baseUrl: 'https://api.deepseek.com'
    },
  };
  
  const defaults = providerDefaults[provider];
  const model = process.env.LLM_MODEL || defaults.model;
  const baseUrl = process.env.LLM_BASE_URL || defaults.baseUrl;
  
  return { provider, apiKey, model, baseUrl };
}

// ============================================================================
// System Prompt with Safety Rules
// ============================================================================

const SYSTEM_PROMPT = `You are a genetics education assistant for MyDNA Explainer. Your role is to help users understand their genetic test reports in plain language.

## CRITICAL SAFETY RULES - You MUST follow these:

1. **EDUCATIONAL ONLY**: You provide educational information about genetics, NOT medical advice, diagnosis, or treatment recommendations.

2. **NEVER provide**:
   - Medical diagnoses
   - Treatment recommendations
   - Medication advice or dosage information
   - Supplement regimens
   - "You should/shouldn't take [medication]" statements
   - Specific risk percentages or disease probability calculations
   - Statements like "you will" or "you won't" get a disease

3. **ALWAYS include**:
   - The standard disclaimer
   - Recommendation to consult healthcare providers/genetic counselors
   - Explanation of limitations and uncertainties
   - Citations and source links where applicable

4. **REFUSAL POLICY**: If the user asks for diagnosis, treatment advice, medication guidance, or any medical decision-making:
   - Politely decline
   - Explain why you cannot help with that specific request
   - Offer an educational alternative
   - Add the request to the "refusals" array in your response

5. **TONE**: Be empathetic and reassuring. Genetic results can be scary. Help users understand that:
   - VUS usually means "we don't know yet" - not "something is wrong"
   - Pathogenic doesn't mean certainty of disease
   - Genetic counselors are the experts for personalized interpretation

## YOUR TASK:

Analyze the provided genetic report text and return a JSON response with:
- extracted_entities: genes, rsIDs, HGVS notations, classifications found
- summary_plain_english: clear explanation of what the report shows
- glossary: definitions for technical terms used
- what_this_does_not_mean: common misinterpretations to avoid
- next_steps: appropriate follow-up actions (NOT medical treatment)
- questions_to_ask: questions the user might ask their healthcare provider
- sources: relevant educational resources
- refusals: any requests you couldn't fulfill and why

## RESPONSE FORMAT:

You MUST respond with valid JSON matching this exact schema:
{
  "disclaimer": "string - the standard medical disclaimer",
  "extracted_entities": [
    {
      "type": "gene|rsid|hgvs|variant_classification|zygosity|condition|unknown",
      "value": "string",
      "confidence": "high|medium|low",
      "notes": "optional string"
    }
  ],
  "summary_plain_english": "string - clear, empathetic summary",
  "glossary": [
    {
      "term": "string",
      "meaning": "string",
      "why_it_matters": "string",
      "common_misreadings": ["optional array of strings"]
    }
  ],
  "what_this_does_not_mean": ["array of common misinterpretations"],
  "next_steps": [
    {
      "title": "string",
      "rationale": "string",
      "who_to_talk_to": "string",
      "urgency": "routine|soon|important|informational"
    }
  ],
  "questions_to_ask": ["array of questions for healthcare provider"],
  "sources": [
    {
      "label": "string",
      "url": "optional URL string",
      "why_relevant": "string"
    }
  ],
  "refusals": [
    {
      "user_intent": "what the user seemed to want",
      "refusal_text": "why you cannot help with this",
      "safe_alternative": "what you can offer instead"
    }
  ]
}

Remember: You are an educator, not a doctor. Help users understand genetics, then direct them to qualified professionals for personalized medical guidance.`;

// ============================================================================
// LLM Client Implementation
// ============================================================================

/**
 * Call OpenAI or OpenAI-compatible APIs (including DeepSeek)
 * DeepSeek uses the same API format, just with a different base URL
 */
async function callOpenAICompatible(prompt: string, reportText: string): Promise<string> {
  const { apiKey, model, baseUrl } = getConfig();
  
  const client = new OpenAI({ 
    apiKey,
    baseURL: baseUrl, // For DeepSeek: https://api.deepseek.com
  });
  
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: `Please analyze this genetic report and provide educational information:\n\n${reportText}` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Lower temperature for more consistent outputs
    max_tokens: 4000,
  });
  
  return response.choices[0]?.message?.content || '';
}

async function callAnthropic(prompt: string, reportText: string): Promise<string> {
  const { apiKey, model } = getConfig();
  
  const client = new Anthropic({ apiKey });
  
  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: prompt,
    messages: [
      { role: 'user', content: `Please analyze this genetic report and provide educational information. Respond with valid JSON only.\n\n${reportText}` }
    ],
  });
  
  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

// ============================================================================
// Main Translation Function
// ============================================================================

export async function translateReport(
  reportText: string,
  options?: { prebuiltOnly?: boolean }
): Promise<TranslateResponse> {
  // PHASE 2: First check for pre-built responses (FREE - no API call)
  const prebuiltMatch = findPrebuiltMatch(reportText);
  
  if (prebuiltMatch && (prebuiltMatch.confidence === 'high' || prebuiltMatch.confidence === 'medium')) {
    console.log(`[translate] Using pre-built response for ${prebuiltMatch.gene} (${prebuiltMatch.classification})`);
    try {
      return generatePrebuiltResponse(prebuiltMatch, reportText);
    } catch {
      console.log('[translate] Pre-built response failed, falling back to LLM');
      // Fall through to LLM
    }
  }

  // Optional strict mode: never call an external LLM.
  // This reduces cost and keeps the app usable even when no LLM key is configured.
  const envPrebuiltOnly =
    process.env.PREBUILT_ONLY_MODE === '1' ||
    process.env.PREBUILT_ONLY_MODE?.toLowerCase() === 'true';
  const prebuiltOnly = options?.prebuiltOnly ?? envPrebuiltOnly;

  if (prebuiltOnly) {
    return {
      disclaimer: getDisclaimer(),
      extracted_entities: [],
      summary_plain_english:
        'Prebuilt-only mode is enabled, so this app will not call an external AI model. ' +
        'I could not find a matching prebuilt template for the text you provided.\n\n' +
        'Try one of these:\n' +
        '- Paste only the “Findings / Results” section\n' +
        '- Include the gene name (e.g., BRCA1) and a classification (Pathogenic / VUS / Benign)\n' +
        '- Include a variant identifier (rsID or HGVS), if present\n\n' +
        'If you want the full AI translation, disable prebuilt-only mode.',
      glossary: [],
      what_this_does_not_mean: [
        'This is NOT a medical interpretation',
        'This does NOT mean your results are normal or abnormal',
        'This does NOT replace a clinician or genetic counselor',
      ],
      next_steps: [
        {
          title: 'Focus the input',
          rationale: 'Shorter, genetics-only text is more likely to match a prebuilt template.',
          who_to_talk_to: 'You (editing the pasted text)',
          urgency: 'informational',
        },
        {
          title: 'Use ClinVar Lookup (if you have an rsID/HGVS)',
          rationale: 'If your report includes a variant identifier, ClinVar can provide public classification context.',
          who_to_talk_to: 'ClinVar tool + a healthcare professional for interpretation',
          urgency: 'routine',
        },
      ],
      questions_to_ask: [
        'Does my report list a specific variant identifier (rsID or HGVS)?',
        'What is the reported classification (Pathogenic, VUS, Benign)?',
        'Should this result be confirmed with clinical testing?',
      ],
      sources: [
        {
          label: 'ClinVar Database',
          url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
          why_relevant: 'Public database for variant classifications and supporting evidence',
        },
        {
          label: 'Questions for a Clinician (template)',
          url: '/kb/templates/questions-for-clinician',
          why_relevant: 'Prepare questions for a genetics professional',
        },
      ],
      refusals: [],
    };
  }
  
  // Fall back to LLM for complex/unknown cases
  const { provider } = getConfig();
  
  // Build context from our knowledge base
  const glossaryContext = buildGlossaryContext([
    'VUS', 'pathogenic', 'benign', 'heterozygous', 'homozygous', 
    'penetrance', 'rsID', 'HGVS'
  ]);
  
  // Enhanced prompt with KB context
  const enhancedPrompt = `${SYSTEM_PROMPT}

## KNOWLEDGE BASE CONTEXT:
Use this glossary information when explaining terms:

${glossaryContext}

## STANDARD DISCLAIMER TO INCLUDE:
${getDisclaimer()}`;

  let responseText: string;
  
  try {
    if (provider === 'anthropic') {
      responseText = await callAnthropic(enhancedPrompt, reportText);
    } else {
      // OpenAI and DeepSeek both use OpenAI-compatible API
      responseText = await callOpenAICompatible(enhancedPrompt, reportText);
    }
    } catch (error) {
      console.error('LLM API error:', error);
      throw new Error('Failed to analyze report. Please try again.');
    }
  
  // Parse and validate the response
  let parsed: unknown;
  try {
    // Try to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;
    parsed = JSON.parse(jsonText.trim());
  } catch {
    console.error('Failed to parse LLM response as JSON:', responseText);
    throw new Error('Failed to parse analysis response. Please try again.');
  }
  
  // Validate against schema
  const validation = translateResponseSchema.safeParse(parsed);
  
  if (!validation.success) {
    console.error('Response validation failed:', validation.error);
    // Return a safe fallback response
    return createFallbackResponse(reportText);
  }
  
  return validation.data;
}

// ============================================================================
// Fallback Response (when LLM fails or returns invalid data)
// ============================================================================

function createFallbackResponse(reportText: string): TranslateResponse {
  // Extract any identifiers we can find
  const entities: ExtractedEntity[] = [];
  
  const rsIdMatches = reportText.match(/\brs\d+\b/gi) || [];
  for (const rsId of rsIdMatches) {
    entities.push({
      type: 'rsid',
      value: rsId,
      confidence: 'high',
    });
  }
  
  return {
    disclaimer: getDisclaimer(),
    extracted_entities: entities,
    summary_plain_english: 'We were unable to fully analyze this report automatically. Please review the extracted information below and consult with a genetic counselor for a complete interpretation.',
    glossary: [
      {
        term: 'Genetic Report',
        meaning: 'A document containing information about genetic variants found in your DNA sample.',
        why_it_matters: 'Understanding your genetic report can help you and your healthcare providers make informed decisions about your health.',
      }
    ],
    what_this_does_not_mean: [
      'This automated analysis is not a substitute for professional interpretation',
      'The presence of variants does not necessarily indicate disease',
    ],
    next_steps: [
      {
        title: 'Consult a Genetic Counselor',
        rationale: 'A certified genetic counselor can provide personalized interpretation of your results',
        who_to_talk_to: 'Certified Genetic Counselor (CGC)',
        urgency: 'routine',
      }
    ],
    questions_to_ask: [
      'What do these specific results mean for my health?',
      'Should I have any additional testing?',
      'What are the implications for my family members?',
    ],
    sources: [
      {
        label: 'National Society of Genetic Counselors',
        url: 'https://www.nsgc.org/findageneticcounselor',
        why_relevant: 'Find a certified genetic counselor in your area',
      },
      {
        label: 'ClinVar Database',
        url: 'https://www.ncbi.nlm.nih.gov/clinvar/',
        why_relevant: 'Look up variant classifications',
      }
    ],
    refusals: [],
  };
}

// ============================================================================
// Check for Disallowed Intent
// ============================================================================

export function checkForDisallowedIntent(text: string): string[] {
  const disallowedPatterns = [
    { pattern: /should i (take|stop|start|change|increase|decrease) ?(my)? (medication|medicine|drug|dose|dosage)/i, intent: 'medication advice' },
    { pattern: /what (medication|medicine|drug|treatment) should i/i, intent: 'treatment recommendation' },
    { pattern: /do i have (cancer|disease|condition|disorder)/i, intent: 'diagnosis request' },
    { pattern: /am i going to (get|develop|die|have)/i, intent: 'prognosis request' },
    { pattern: /what (supplements?|vitamins?) should/i, intent: 'supplement advice' },
    { pattern: /diagnose/i, intent: 'diagnosis request' },
    { pattern: /prescribe/i, intent: 'prescription request' },
    { pattern: /cure|treat my/i, intent: 'treatment request' },
  ];
  
  const detectedIntents: string[] = [];
  
  for (const { pattern, intent } of disallowedPatterns) {
    if (pattern.test(text)) {
      detectedIntents.push(intent);
    }
  }
  
  return detectedIntents;
}

// ============================================================================
// Provider Information (for debugging/logging)
// ============================================================================

export function getProviderInfo(): { provider: string; model: string } {
  const { provider, model } = getConfig();
  return { provider, model };
}
