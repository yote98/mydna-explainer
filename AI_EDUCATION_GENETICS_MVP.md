# AI-Education Genetics MVP (Project Brief + Handoff Pack)

**Working name**: MyDNA Explainer (Genetic Literacy + Report Translator + Prevention Planning)  
**Primary domain**: `ai-education.net` (education framing keeps risk low)  
**Core promise**: Help people *understand* genetic reports and prepare better questions/actions with a professional — **not** diagnose, treat, or provide medical advice.

---

## 1) Product goal (what “done” looks like)

Build a global, privacy-first web app where a user can paste/upload a DNA report snippet and get:
- **Plain-language translation** of terms and sections (with citations/links to sources)
- **Risk literacy** explanations (what variants do/don’t mean; VUS; penetrance; population limits)
- **Next-steps checklist** (“how to confirm”, “who to talk to”, “what to bring”, “family history worksheet”)
- **Optional factual lookups** (e.g., ClinVar summary for a known variant id)

Non-goals (v1):
- No diagnosis, treatment, dosage, supplement regimens, or “prevent disease” prescriptions
- No “your risk is X%” calculators
- No “you should/shouldn’t take medication” outputs
- No storage/accounts by default (avoid handling sensitive genomics data until v2)

---

## 2) Non‑negotiable safety rules

- **Educational only**: every screen includes “not medical advice / not diagnostic” messaging.
- **Refusal policy**: the system must refuse or redirect any request asking for diagnosis/treatment/medication changes.
- **Citations required**: for any claim about a variant/classification, link to a primary source page.
- **Minimal data retention**: default is “process in-memory and discard”; no analytics that capture report text.
- **Sensitive data warning**: genetic reports can be identifying; user is warned before upload/paste.

---

## 3) Data plan (where we get factual data)

### 3.1 Best “safe + usable” sources for v1

1) **ClinVar (NCBI)**
- **Use case**: variant clinical significance summaries (“pathogenic/benign/VUS”, conditions, review status).
- **Access**:
  - NCBI ClinVar via **E-utilities** (esearch/esummary/efetch are supported for ClinVar).
  - ClinVar has a published **access and use** page and a clear disclaimer.
- **Important constraint**: ClinVar itself states it’s **not intended for direct diagnostic use or medical decision‑making**; attribution requested.

2) **GWAS Catalog (NHGRI‑EBI)**
- **Use case**: educational “research associations” and context (“association ≠ diagnosis”; ancestry/population caveats).
- **Access**: GWAS REST API (note: V2 exists and V1 retirement is scheduled no later than May 2026).

3) **Pharmacogenomics (optional, later in v1 or v1.1)**
- **CPIC** is highly permissive (public domain dedication) and can be used for “questions to ask your clinician/pharmacist”.
- If we include **ClinPGx/PharmGKB APIs**, treat licensing carefully (share‑alike implications) and keep outputs as citations + summaries.

### 3.2 Sources to avoid ingesting (v1)

- **SNPedia**: content is under a **non‑commercial** license unless you negotiate a commercial license → avoid ingestion; at most, link out.
- Paid datasets (e.g., OMIM) → avoid.

### 3.3 Practical v1 strategy (recommended)

- Ship a **curated local Knowledge Base** (glossary + templates + “what this means” explainers).
- Add **optional live factual lookups**:
  - If the user supplies a known identifier (rsID, HGVS, ClinVar VariationID/VCV), fetch ClinVar summary and provide a source link.
  - Otherwise: stay in “translation + literacy” mode using the KB and generic genetics education.

---

## 4) MVP user flows (screens)

### Flow A — “Translate my report”
1) Landing + safety banner
2) Input (paste text / upload PDF)
3) Extracted items (genes, rsIDs/HGVS, terms like “VUS”, “heterozygous”)
4) Output tabs:
   - **Plain English**
   - **Key terms glossary**
   - **What this does NOT mean**
   - **Questions for your clinician**
   - **Cited sources**

### Flow B — “Variant lookup (factual)”
1) Enter rsID / HGVS / ClinVar VariationID
2) Show:
   - ClinVar summary snapshot (classification + links)
   - “How to interpret ClinVar” explainer (limitations, submissions, review status)
   - Safety reminder

### Flow C — “Prevention planner (safe version)”
Not “prevent disease”; instead:
- **Appointment checklist** (what to ask; what records to bring)
- **Family history worksheet** (downloadable)
- **Confirmatory steps** (“clinical-grade testing”, “genetic counselor”, “repeat testing if needed”)

---

## 5) Output schema (deterministic, inspectable)

All LLM outputs must be returned as structured JSON, then rendered.

Minimum schema:
- `disclaimer`: string
- `extracted_entities`: array of { `type`, `value`, `confidence`, `notes` }
- `summary_plain_english`: string
- `glossary`: array of { `term`, `meaning`, `why_it_matters`, `common_misreadings` }
- `next_steps`: array of { `title`, `rationale`, `who_to_talk_to`, `urgency` }
- `questions_to_ask`: array of strings
- `sources`: array of { `label`, `url`, `why_relevant` }
- `refusals`: array of { `user_intent`, `refusal_text`, `safe_alternative` }

---

## 6) Architecture (simple + safe)

### Frontend
- Next.js (App Router), Tailwind, shadcn/ui
- Pages:
  - `/` landing
  - `/translate` report translator
  - `/lookup` variant lookup
  - `/privacy` and `/disclaimer`

### Backend
- One lightweight API route for:
  - `POST /api/translate` (LLM call + JSON schema enforcement)
  - `GET /api/clinvar?query=...` (server-side proxy to protect rate limits + normalize output)
- Add caching (in-memory) for ClinVar lookups to reduce API calls.

### Privacy defaults
- No accounts.
- No saving report text.
- Optional “download result as JSON/PDF” happens client-side where possible.

---

## 7) Compliance posture (practical)

- **PDPA/GDPR-minded** by default:
  - minimal data, explicit consent, clear deletion semantics (“we don’t store your report”)
  - “do not upload if you’re not comfortable; redact identifiers” guidance
- Clear escalation wording: “seek a licensed genetic counselor / clinician”.

---

## 8) Build prompt for Opus (copy/paste)

> You are building a production-grade MVP web app for `ai-education.net`: **MyDNA Explainer** (Genetic Literacy + Report Translator + Planning).  
> Non-negotiables: educational only; no medical advice; no diagnosis; no treatment/dosage/supplements; strong refusal policy; citations/links required; minimal data retention (no accounts); deterministic JSON output schema.  
> Build with Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.  
> Deliver pages: `/`, `/translate`, `/lookup`, `/privacy`, `/disclaimer`.  
> Implement `POST /api/translate` that accepts pasted text and returns structured JSON per the schema in this doc. Enforce schema validation and include `refusals` for disallowed intents.  
> Implement `GET /api/clinvar` as a server-side proxy that can accept rsID/HGVS/VariationID, calls ClinVar via E-utilities (or a documented alternative), normalizes a compact JSON summary, and returns source links. Add in-memory caching + basic rate limiting.  
> Include a small local Knowledge Base (markdown/json) with glossary entries (VUS, pathogenic/benign, heterozygous, penetrance, ancestry bias, polygenic vs monogenic, etc.) used for explanations.  
> Provide a `README.md` with setup, environment variables, and a “safety & scope” section.  
> Do not add auth. Do not add payments. Do not store uploaded files. Do not use any real patient data. Provide a small set of synthetic example inputs for testing.

---

## 9) Windsurf “second app” ideas (fast + purposeful, not death-related)

Pick one for quick shipping while the genetics MVP is building:

1) **AI Readiness Quiz (SME / personal)** (for `ai-services.my`)
- 15 questions → generates a practical adoption roadmap + PDF.

2) **Multilingual Plain‑Language Translator for forms** (general public good)
- Paste any complex document → “plain English + Bahasa” summary + action checklist (you already have legal; this would be broader).

3) **Travel Health Pack Builder** (fits your upcoming Vietnam trip)
- Destination + conditions + medications list → outputs a packing checklist + questions for pharmacist/clinic (no diagnosis).

---

## 10) Immediate next steps (for you)

- Create a new repo/folder for the genetics app (separate from `trading_assistant`).
- Paste the Opus prompt above.
- When Opus finishes scaffolding, we wire up:
  - deployment (Vercel)
  - domain mapping (`ai-education.net`)
  - analytics with privacy-safe settings (optional)

---

## 11) Folder switch checklist (copy into the new repo)

### Recommended structure

```
mydna-explainer/
  README.md
  LICENSE
  app/                  # Next.js App Router
  src/
  public/
  kb/                   # local glossary + explainers (md/json)
  docs/
    DISCLAIMER.md
    PRIVACY.md
    SAFETY_POLICY.md
  tests/                # synthetic fixtures only
```

### Environment variables (minimum)

- **`LLM_PROVIDER`**: e.g. `openai` / `anthropic` / `zai` (your choice)
- **`LLM_API_KEY`**: your API key (server-side only)
- **`NCBI_API_KEY`**: optional but recommended for higher rate limits when calling NCBI E-utilities

### “No sensitive data” guardrails for v1

- Add `.env*` to `.gitignore`
- Ensure logging never prints uploaded text (log request IDs only)
- Include “redact identifiers” guidance near the upload box

---

## 12) Source links (implementation references)

- **ClinVar access & data-use disclaimer**: `https://www.ncbi.nlm.nih.gov/clinvar/docs/maintenance_use/`
- **NCBI E-utilities overview**: `https://www.ncbi.nlm.nih.gov/books/NBK25497/`
- **GWAS Catalog API docs**: `https://www.ebi.ac.uk/gwas/docs/api`
- **SNPedia Terms (non-commercial license)**: `https://snpedia.com/index.php/Terms_of_Use`

