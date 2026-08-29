/**
 * Static registry of all knowledge-base content, imported at build time so the
 * same code runs on Vercel (Next.js/webpack) and Cloudflare Workers
 * (Vite/vinext). Workers have no runtime filesystem access to the repository,
 * so content read with `fs` must instead be bundled as modules.
 *
 * To add KB content: drop the file in kb/ and register it below
 * (JSON via a plain import, markdown via `?raw`).
 */
import type { GlossaryData, NextStepsTemplate, QuestionsTemplate } from './kb';
import type { PrebuiltData } from './prebuilt-responses';

import commonGenes from '../kb/prebuilt/common-genes.json';
import extendedGenes from '../kb/prebuilt/extended-genes.json';
import glossaryJson from '../kb/glossary.json';
import questionsForClinicianJson from '../kb/templates/questions-for-clinician.json';
import nextStepsChecklistJson from '../kb/templates/next-steps-checklist.json';

import clinvarClassificationsMd from '../kb/explainers/clinvar-classifications.md?raw';
import dtcTestingLimitationsMd from '../kb/explainers/dtc-testing-limitations.md?raw';
import vusExplainedMd from '../kb/explainers/vus-explained.md?raw';
import whatGeneticTestsCannotTellYouMd from '../kb/explainers/what-genetic-tests-cannot-tell-you.md?raw';

/** Markdown explainers keyed by URL slug. */
export const explainers: Record<string, string> = {
  'clinvar-classifications': clinvarClassificationsMd,
  'dtc-testing-limitations': dtcTestingLimitationsMd,
  'vus-explained': vusExplainedMd,
  'what-genetic-tests-cannot-tell-you': whatGeneticTestsCannotTellYouMd,
};

/** JSON templates keyed by URL slug. */
export const templates: Record<string, unknown> = {
  'questions-for-clinician': questionsForClinicianJson,
  'next-steps-checklist': nextStepsChecklistJson,
};

export const explainerSlugs = Object.keys(explainers);
export const templateSlugs = Object.keys(templates);

export const glossary: GlossaryData = glossaryJson as unknown as GlossaryData;
export const questionsTemplate: QuestionsTemplate =
  questionsForClinicianJson as unknown as QuestionsTemplate;
export const nextStepsTemplate: NextStepsTemplate =
  nextStepsChecklistJson as unknown as NextStepsTemplate;

export const prebuiltBase: PrebuiltData = commonGenes as unknown as PrebuiltData;
export const prebuiltExtended: Partial<PrebuiltData> =
  extendedGenes as unknown as Partial<PrebuiltData>;
