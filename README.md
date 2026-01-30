# MyDNA Explainer

**Genetic Literacy + Report Translator + Planning Tool**

MyDNA Explainer is a privacy-first web application that helps users understand their genetic test reports in plain language. It provides educational information about genetic terms, variant classifications, and helps users prepare questions for healthcare professionals.

> **Important**: This is an educational tool only. It does NOT provide medical advice, diagnosis, or treatment recommendations.

## Features

- **Report Translation**: Paste genetic test report text and get plain-language explanations
- **Prebuilt Knowledge (Low/No Cost)**: Many common genes and result patterns return instant educational responses (no LLM call)
- **Prebuilt-only ($0) Mode**: Optional mode that never calls an external LLM (good for public demos / strict privacy)
- **Variant Lookup**: Look up specific genetic variants in ClinVar
- **Glossary**: Comprehensive explanations of genetic terminology (VUS, pathogenic, penetrance, etc.)
- **Next Steps Guidance**: Suggested questions and checklists for healthcare provider appointments
- **PDF/Text Upload + OCR (Client-side)**: Extract text from PDFs (server-side) and images (client-side OCR)
- **Client-side PII Redaction**: Helps remove common identifiers before submitting text
- **Keep Only Genetics**: Filters out lifestyle/marketing content from long consumer reports
- **Suggested Reading (PubMed)**: Optional “find papers” list based on detected gene/topic keywords (not full report text)
- **Privacy-First**: No data storage, no accounts, process in-memory only

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **LLM**: Configurable (DeepSeek recommended, also supports OpenAI and Anthropic)
- **External APIs**: NCBI ClinVar E-utilities + PubMed (E-utilities)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Optional LLM API key (DeepSeek/OpenAI/Anthropic) if you want “Auto” mode to use an LLM
- Optional NCBI API key (free) for higher NCBI rate limits

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mydna-explainer.git
   cd mydna-explainer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```env
   LLM_PROVIDER=deepseek        # recommended (also: "openai" or "anthropic")
   LLM_API_KEY=your_api_key_here
   NCBI_API_KEY=                # optional, for higher rate limits
   # PREBUILT_ONLY_MODE=true    # optional: strict $0 mode (no external LLM)
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_PROVIDER` | No* | `deepseek` (recommended), `openai`, or `anthropic` |
| `LLM_API_KEY` | No* | Your LLM provider API key |
| `LLM_MODEL` | No | Override default model (see below) |
| `LLM_BASE_URL` | No | Custom API endpoint (auto-configured for each provider) |
| `NCBI_API_KEY` | No | NCBI API key for higher ClinVar/PubMed rate limits |
| `PREBUILT_ONLY_MODE` | No | If `true`, never call an external LLM (prebuilt + KB only) |
| `ALLOW_CLIENT_MODE_SWITCH` | No | If `true` (or in non-production), allow per-request mode override (`auto` vs `prebuilt_only`) |
| `RATE_LIMIT_TRANSLATE_PER_MIN` | No | Per-IP rate limit for `/api/translate` (default: 10/min) |
| `RATE_LIMIT_LITERATURE_PER_MIN` | No | Per-IP rate limit for `/api/literature` (default: 30/min) |

\*If `PREBUILT_ONLY_MODE=true`, the app can run without `LLM_PROVIDER` / `LLM_API_KEY`. In “Auto” mode, an LLM key is required when no prebuilt match exists.

### LLM Provider Comparison

| Provider | Default Model | Cost (per 1M tokens) | Best For |
|----------|--------------|---------------------|----------|
| **DeepSeek** | deepseek-chat | $0.07 in / $1.10 out | Cost efficiency + medical accuracy |
| OpenAI | gpt-4o | $2.50 in / $10.00 out | Multimodal, general reasoning |
| Anthropic | claude-3-5-sonnet | $3.00 in / $15.00 out | Long context, nuanced responses |

**Recommendation**: DeepSeek offers 27-35x cost savings with comparable medical reasoning accuracy (93%+ on genetic diagnostics benchmarks).

## Project Structure

```
mydna-explainer/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── translate/     # Report translation endpoint
│   │   └── clinvar/       # ClinVar lookup endpoint
│   │   ├── literature/    # PubMed suggested reading endpoint
│   │   └── extract-text/  # PDF/TXT extraction endpoint
│   ├── translate/         # Report translator page
│   ├── lookup/            # Variant lookup page
│   ├── kb/                # KB pages (templates + explainers)
│   ├── privacy/           # Privacy policy page
│   └── disclaimer/        # Disclaimer page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # App-specific components
├── lib/                   # Utility libraries
│   ├── llm.ts            # LLM client abstraction
│   ├── clinvar.ts        # ClinVar API client
│   ├── schema.ts         # Zod validation schemas
│   ├── kb.ts             # Knowledge base loader
│   └── cache.ts          # In-memory caching
├── kb/                    # Knowledge base content
│   ├── glossary.json     # Genetics terms glossary
│   ├── explainers/       # Educational content
│   └── templates/        # Output templates
├── docs/                  # Documentation
└── tests/                 # Test fixtures
```

## Safety & Scope

### What This Tool Does

- Translates genetic report text into plain language
- Explains genetic terminology and concepts
- Looks up variant information in public databases
- Suggests questions for healthcare providers
- Provides educational resources

### What This Tool Does NOT Do

- Provide medical diagnoses
- Recommend treatments or medications
- Calculate disease risk percentages
- Replace genetic counselors or doctors
- Store user genetic data

### Safety Features

1. **Refusal Policy**: The LLM is instructed to refuse requests for diagnosis, treatment advice, or medical decision-making
2. **Disclaimer Banners**: Persistent reminders that this is educational only
3. **No Data Storage**: All processing is in-memory; nothing is logged or stored
4. **Citations Required**: All factual claims include sources/links
5. **Structured Output**: All responses follow a validated JSON schema

## API Documentation

### POST /api/translate

Translates genetic report text into structured educational content.

**Request:**
```json
{
  "text": "Your genetic report text here...",
  "mode": "auto"
}
```

`mode` is optional:
- `auto` (default): uses prebuilt first, then LLM if needed
- `prebuilt_only`: never calls external LLMs (best for $0 / strict privacy)

**Response:**
```json
{
  "disclaimer": "...",
  "extracted_entities": [...],
  "summary_plain_english": "...",
  "glossary": [...],
  "what_this_does_not_mean": [...],
  "next_steps": [...],
  "questions_to_ask": [...],
  "sources": [...],
  "refusals": [...]
}
```

### POST /api/literature

Returns a small list of suggested PubMed reading based on gene/topic keywords (does **not** send full report text).

**Request:**
```json
{
  "genes": ["BRCA1"],
  "topics": ["hereditary cancer"],
  "max_results": 5
}
```

### POST /api/extract-text

Extracts text from uploaded PDF or TXT files. Responses are `Cache-Control: no-store`.

### GET /api/clinvar

Looks up a variant in the ClinVar database.

**Request:**
```
GET /api/clinvar?query=rs1234567
```

**Response:**
```json
{
  "query": "rs1234567",
  "found": true,
  "variant": {
    "variation_id": "...",
    "name": "...",
    "clinical_significance": "...",
    "review_status": "...",
    "conditions": [...],
    "source_url": "..."
  },
  "interpretation_guide": "...",
  "disclaimer": "..."
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Self-hosted

## Contributing

Contributions are welcome! Please read the safety guidelines carefully - any changes must maintain the educational-only scope and safety features.

## License

MIT License - see LICENSE file for details.

## Disclaimer

This software is provided for educational purposes only. It is not intended to be used as a medical device, diagnostic tool, or substitute for professional medical advice. See the full disclaimer at `/disclaimer`.

## Resources

- [ClinVar Database](https://www.ncbi.nlm.nih.gov/clinvar/)
- [Find a Genetic Counselor](https://www.nsgc.org/findageneticcounselor)
- [MedlinePlus Genetics](https://medlineplus.gov/genetics/)
- [NCBI E-utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25497/)
