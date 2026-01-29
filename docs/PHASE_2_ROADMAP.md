# MyDNA Explainer - Phase 2 Roadmap

**Domain**: www.ai-education.net  
**Mission**: Free genetic literacy tool to help people understand their genetic reports  
**Goal**: Minimize/eliminate API costs while maximizing accessibility

---

## Phase 2 Features (Priority Order)

### 1. PDF Text Extraction (Priority: HIGH)
**Problem**: Most genetic reports (Circle DNA, 23andMe, etc.) are PDFs with graphics  
**Solution**: Add PDF upload with automatic text extraction

- Accept PDF file uploads
- Extract text using `pdf-parse` library (server-side, free)
- Display extracted text for user review before analysis
- Handle multi-page documents
- Graceful fallback if extraction fails

**Cost**: Free (no external API)

### 2. Pre-built Responses for Common Genes (Priority: HIGH)
**Problem**: Paying for LLM on repetitive, well-known genetic findings  
**Solution**: Curated knowledge base responses for common scenarios

Common genes to pre-build:
- BRCA1/BRCA2 (breast cancer risk)
- APOE (Alzheimer's risk)
- MTHFR (folate metabolism)
- Factor V Leiden (blood clotting)
- CHEK2, PALB2 (cancer genes)
- CYP2D6, CYP2C19 (drug metabolism)
- HFE (hemochromatosis)
- Common pharmacogenomic genes

**Cost**: Free (no API calls for known patterns)

### 3. Image OCR Support (Priority: MEDIUM)
**Problem**: Users screenshot mobile app results  
**Solution**: Browser-based OCR using Tesseract.js

- Accept image uploads (PNG, JPG, WebP)
- Run OCR entirely in browser (no server cost)
- Extract text from genetic report screenshots
- Works offline

**Cost**: Free (client-side processing)

### 4. Ollama Local LLM Integration (Priority: MEDIUM)
**Problem**: API costs for users who want completely free usage  
**Solution**: Optional local LLM via Ollama

- Detect if user has Ollama running locally
- Use local models (mistral, llama3, etc.)
- Fallback to DeepSeek if local unavailable
- Perfect for privacy-conscious users

**Cost**: Free (user's hardware)

### 5. Report Template Parsers (Priority: LOW)
**Problem**: Different labs format reports differently  
**Solution**: Custom parsers for popular services

Templates to build:
- Circle DNA
- 23andMe
- AncestryDNA Health
- Nebula Genomics
- Invitae/Color clinical reports

**Cost**: Free (pattern matching)

---

## Implementation Plan

### Sprint 1: PDF & Pre-built Responses
- [ ] Add PDF upload component
- [ ] Integrate pdf-parse library
- [ ] Create pre-built response database for top 20 genes
- [ ] Add smart routing (pre-built vs LLM)

### Sprint 2: Image OCR
- [ ] Add image upload component
- [ ] Integrate Tesseract.js
- [ ] Add image preview and crop functionality
- [ ] Test with various report screenshots

### Sprint 3: Local LLM & Polish
- [ ] Add Ollama integration
- [ ] Create LLM provider selector in UI
- [ ] Add usage statistics (anonymous)
- [ ] Performance optimization

---

## Architecture: Cost-Saving Flow

```
User Input (Text/PDF/Image)
           ↓
   ┌───────────────────┐
   │  Text Extraction  │  ← PDF/Image processing (FREE)
   └───────────────────┘
           ↓
   ┌───────────────────┐
   │  Pattern Matcher  │  ← Check for known genes (FREE)
   │  Known gene/VUS?  │
   └───────────────────┘
        ↓ YES              ↓ NO
   ┌────────────┐    ┌─────────────────┐
   │ Pre-built  │    │ Check for local │
   │ Response   │    │ Ollama LLM      │
   │ (FREE)     │    └─────────────────┘
   └────────────┘         ↓ YES           ↓ NO
                    ┌────────────┐  ┌─────────────┐
                    │ Local LLM  │  │ DeepSeek    │
                    │ (FREE)     │  │ (~$0.0001)  │
                    └────────────┘  └─────────────┘
```

---

## Estimated Cost Savings

| Scenario | Before (DeepSeek) | After (Phase 2) |
|----------|------------------|-----------------|
| Known gene query | $0.0001 | $0 (pre-built) |
| PDF upload | $0.0003 | $0.0001 (extract + analyze) |
| Common VUS | $0.0001 | $0 (pre-built) |
| Complex query | $0.0002 | $0.0002 (LLM needed) |

**Expected API cost reduction: 70-80%**

---

## Files to Create/Modify

### New Files
- `lib/pdf-extract.ts` - PDF text extraction
- `lib/ocr.ts` - Image OCR processing
- `lib/prebuilt-responses.ts` - Known gene responses
- `lib/ollama.ts` - Local LLM client
- `kb/prebuilt/` - Pre-built response templates
- `components/FileUpload.tsx` - PDF/Image upload component

### Modified Files
- `lib/llm.ts` - Add routing logic
- `components/ReportInput.tsx` - Add file upload option
- `app/api/translate/route.ts` - Handle file uploads

---

## Success Metrics

1. **Cost**: <$1/month for 10,000 users
2. **Coverage**: 80% of queries answered without API
3. **Accessibility**: Works on mobile, supports PDF/images
4. **Privacy**: Local LLM option available
