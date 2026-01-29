# Safety Policy

**Last Updated:** January 2026

This document outlines the safety measures built into MyDNA Explainer to protect users from harm.

## Core Safety Principles

1. **Educational Only**: This tool provides education, not medical advice
2. **No Diagnosis**: We never diagnose conditions or diseases
3. **No Treatment**: We never recommend treatments, medications, or supplements
4. **Professional Referral**: We always direct users to qualified professionals
5. **Transparency**: We are clear about what we can and cannot do

## Refusal Policy

The system is programmed to refuse and redirect any requests for:

### Explicitly Refused

- Medical diagnoses ("Do I have cancer?")
- Treatment recommendations ("What medication should I take?")
- Dosage advice ("Should I increase my medication?")
- Supplement regimens ("What vitamins should I take?")
- Prognosis predictions ("Will I get sick?")
- Risk percentages ("What's my chance of getting X?")
- Medical decision-making ("Should I have surgery?")

### Response to Refused Requests

When a refused request is detected:
1. The system politely declines to answer
2. Explains why it cannot help with that specific request
3. Offers an educational alternative
4. Documents the refusal in the response

## Output Safety Features

### Mandatory Disclaimer

Every response includes a disclaimer stating:
- This is educational information only
- It is not medical advice
- Users should consult healthcare professionals

### Structured Output

All outputs follow a validated schema that includes:
- `disclaimer`: Always present
- `refusals`: Any requests that were declined
- `sources`: Citations for factual claims
- `next_steps`: Always recommend professional consultation

### Language Guidelines

The LLM is instructed to:
- Use empathetic, reassuring language
- Avoid alarming or fear-inducing phrasing
- Emphasize uncertainty and limitations
- Clarify what results do NOT mean
- Remind users that genetics is not destiny

## Content Safety

### VUS (Variant of Uncertain Significance)

The system emphasizes that VUS:
- Is NOT a diagnosis
- Usually gets reclassified as benign
- Should not drive medical decisions
- Requires professional interpretation

### Pathogenic Variants

The system emphasizes that pathogenic:
- Does NOT mean certainty of disease
- Risk depends on penetrance
- Individual outcomes vary
- Requires professional interpretation

### Risk Communication

We avoid:
- Specific percentages ("You have a 60% risk")
- Absolute statements ("You will develop X")
- Comparisons ("Your risk is 3x higher")

We use instead:
- Qualitative descriptions ("increased risk" vs specific numbers)
- Educational context ("what this generally means")
- Emphasis on individual variation

## Data Safety

### No Storage

- Genetic data is not stored
- No database of user reports
- No logs containing genetic information
- Processing is in-memory only

### No Learning

- User data is not used to train models
- No feedback loops involving genetic data
- Each session is independent

## ClinVar Data

When displaying ClinVar data, we:
- Include NCBI's disclaimer about diagnostic use
- Explain review status and evidence levels
- Note that classifications can change
- Emphasize professional interpretation needed

## Quality Assurance

### Schema Validation

All LLM outputs are validated against a strict schema. Invalid responses:
- Are caught by validation
- Trigger a safe fallback response
- Are logged for review (without user data)

### Fallback Responses

If the LLM fails or returns invalid data:
- A safe, generic educational response is provided
- Users are directed to professional resources
- The failure is logged (without user data)

## Continuous Improvement

### Monitoring

We monitor for:
- Refusal bypass attempts
- Inappropriate responses
- Edge cases in safety handling
- User feedback on safety concerns

### Updates

Safety measures are regularly reviewed and updated based on:
- Identified issues
- User feedback
- Best practices in medical AI
- Regulatory guidance

## Reporting Safety Issues

If you identify a safety issue:
1. Document the issue (without sharing sensitive data)
2. Contact us through the website
3. We will investigate and address promptly

## Limitations

This safety policy cannot guarantee:
- Perfect accuracy of educational information
- Prevention of all possible misuse
- Complete alignment with all user expectations

Users must ultimately:
- Use judgment about the information
- Consult qualified professionals
- Not rely solely on this tool

---

**Our Commitment:** We prioritize user safety above all else. This tool exists to educate and empower, not to replace professional medical care. We continuously work to improve our safety measures and welcome feedback on how to better protect users.
