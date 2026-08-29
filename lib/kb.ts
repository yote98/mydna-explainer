import {
  glossary as glossaryContent,
  nextStepsTemplate,
  questionsTemplate,
} from './kb-content';

// Types for the knowledge base
export interface GlossaryTerm {
  term: string;
  full_name: string;
  meaning: string;
  why_it_matters: string;
  common_misreadings: string[];
  what_to_do: string;
}

export interface GlossaryData {
  terms: GlossaryTerm[];
}

export interface QuestionsTemplate {
  general_questions: string[];
  for_vus_results: string[];
  for_pathogenic_results: string[];
  for_carrier_status: string[];
  about_the_test: string[];
}

export interface ChecklistItem {
  task: string;
  why: string;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}

export interface NextStepsTemplate {
  appointment_preparation: {
    title: string;
    items: ChecklistItem[];
  };
  family_history_worksheet: {
    title: string;
    categories: ChecklistCategory[];
  };
  confirmatory_testing: {
    title: string;
    when_needed: string[];
    what_to_expect: string[];
  };
  finding_genetic_counselor: {
    title: string;
    resources: { name: string; url: string; note: string }[];
    what_they_do: string[];
  };
}

// Cache for loaded data
let glossaryCache: GlossaryData | null = null;
let questionsCache: QuestionsTemplate | null = null;
let nextStepsCache: NextStepsTemplate | null = null;

// Load and cache the glossary (bundled at build time via lib/kb-content)
export function getGlossary(): GlossaryData {
  if (glossaryCache) return glossaryCache;
  glossaryCache = glossaryContent;
  return glossaryCache;
}

// Get a specific term from the glossary
export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
  const glossary = getGlossary();
  return glossary.terms.find(
    t => t.term.toLowerCase() === term.toLowerCase() ||
         t.full_name.toLowerCase() === term.toLowerCase()
  );
}

// Get terms that match a list of keywords
export function getMatchingTerms(keywords: string[]): GlossaryTerm[] {
  const glossary = getGlossary();
  const normalizedKeywords = keywords.map(k => k.toLowerCase());
  
  return glossary.terms.filter(term => 
    normalizedKeywords.some(keyword =>
      term.term.toLowerCase().includes(keyword) ||
      term.full_name.toLowerCase().includes(keyword) ||
      term.meaning.toLowerCase().includes(keyword)
    )
  );
}

// Load questions template
export function getQuestionsTemplate(): QuestionsTemplate {
  if (questionsCache) return questionsCache;
  questionsCache = questionsTemplate;
  return questionsCache;
}

// Load next steps template
export function getNextStepsTemplate(): NextStepsTemplate {
  if (nextStepsCache) return nextStepsCache;
  nextStepsCache = nextStepsTemplate;
  return nextStepsCache;
}

// Get questions relevant to specific result types
export function getRelevantQuestions(resultTypes: ('vus' | 'pathogenic' | 'carrier' | 'general')[]): string[] {
  const template = getQuestionsTemplate();
  const questions: string[] = [...template.general_questions];
  
  if (resultTypes.includes('vus')) {
    questions.push(...template.for_vus_results);
  }
  if (resultTypes.includes('pathogenic')) {
    questions.push(...template.for_pathogenic_results);
  }
  if (resultTypes.includes('carrier')) {
    questions.push(...template.for_carrier_status);
  }
  
  // Remove duplicates
  return [...new Set(questions)];
}

// Build context string for LLM from glossary terms
export function buildGlossaryContext(terms: string[]): string {
  const matchingTerms = getMatchingTerms(terms);
  
  if (matchingTerms.length === 0) return '';
  
  return matchingTerms.map(term => 
    `**${term.term}** (${term.full_name}): ${term.meaning}\n` +
    `Why it matters: ${term.why_it_matters}\n` +
    `What to do: ${term.what_to_do}`
  ).join('\n\n');
}

// Get the standard disclaimer text
export function getDisclaimer(): string {
  return `This information is for educational purposes only and is not intended as medical advice, diagnosis, or treatment. Genetic information should be interpreted by qualified healthcare professionals in the context of your complete health history. Always consult with a licensed healthcare provider or certified genetic counselor before making any medical decisions based on genetic test results.`;
}

// Get the short disclaimer for UI banners
export function getShortDisclaimer(): string {
  return `Educational only. Not medical advice. Consult a healthcare provider or genetic counselor for personalized guidance.`;
}
