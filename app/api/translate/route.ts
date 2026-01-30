import { NextRequest, NextResponse } from 'next/server';
import { validateTranslateRequest, ErrorResponse } from '@/lib/schema';
import { translateReport, checkForDisallowedIntent } from '@/lib/llm';
import { ZodError } from 'zod';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { findPrebuiltMatch, generatePrebuiltResponse } from '@/lib/prebuilt-responses';

export const runtime = 'nodejs';

// Prevent logging of sensitive data
const SAFE_LOG = (message: string, meta?: Record<string, unknown>) => {
  // Only log safe metadata, never the actual report text
  console.log(`[translate] ${message}`, meta ? JSON.stringify(meta) : '');
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  try {
    // Basic rate limiting (best-effort, per-instance)
    const ip = getClientIp(request);
    const limitPerMin = Number(process.env.RATE_LIMIT_TRANSLATE_PER_MIN || 10);
    const rl = rateLimit(`translate:${ip}`, { windowMs: 60_000, max: Math.max(1, limitPerMin) });
    if (!rl.allowed) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please wait a bit and try again.',
        },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(Math.ceil(rl.resetMs / 1000)),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
          },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
    return NextResponse.json<ErrorResponse>(
      { error: 'Invalid JSON in request body' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
    }

    // Validate request
    let validatedRequest;
    try {
      validatedRequest = validateTranslateRequest(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'Validation failed', 
            details: error.errors.map(e => e.message).join(', ')
          },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      throw error;
    }

    const { text, mode } = validatedRequest;

    // Log request metadata only (never the actual text)
    SAFE_LOG('Processing request', {
      requestId,
      textLength: text.length,
      timestamp: new Date().toISOString(),
    });

    // Check for obviously disallowed intents
    const disallowedIntents = checkForDisallowedIntent(text);
    if (disallowedIntents.length > 0) {
      SAFE_LOG('Detected disallowed intents', { requestId, intents: disallowedIntents });
      // We'll still process but the LLM will handle refusals
    }

    // If a prebuilt match exists, return it immediately (no LLM key required).
    const prebuiltMatch = findPrebuiltMatch(text);
    if (prebuiltMatch && (prebuiltMatch.confidence === 'high' || prebuiltMatch.confidence === 'medium')) {
      const result = generatePrebuiltResponse(prebuiltMatch, text);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
        }
      });
    }

    const envPrebuiltOnly =
      process.env.PREBUILT_ONLY_MODE === '1' ||
      process.env.PREBUILT_ONLY_MODE?.toLowerCase() === 'true';

    const allowClientSwitch =
      process.env.ALLOW_CLIENT_MODE_SWITCH === '1' ||
      process.env.ALLOW_CLIENT_MODE_SWITCH?.toLowerCase() === 'true' ||
      process.env.NODE_ENV !== 'production';

    const prebuiltOnly =
      allowClientSwitch && mode === 'auto'
        ? false
        : allowClientSwitch && mode === 'prebuilt_only'
          ? true
          : envPrebuiltOnly;

    // In prebuilt-only mode we allow requests without an LLM key.
    if (!prebuiltOnly && !process.env.LLM_API_KEY) {
      SAFE_LOG('LLM API key not configured', { requestId });
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Service not configured', 
          details: 'LLM API key is not set. Please configure the LLM_API_KEY environment variable or enable PREBUILT_ONLY_MODE.'
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Translate the report
    const result = await translateReport(text, { prebuiltOnly });

    SAFE_LOG('Request completed successfully', {
      requestId,
      entitiesFound: result.extracted_entities.length,
      refusals: result.refusals.length,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
      }
    });

  } catch (error) {
    SAFE_LOG('Request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't expose internal error details to client
    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Failed to analyze report',
        details: 'An error occurred while processing your request. Please try again.'
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    { error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { 'Cache-Control': 'no-store' } }
  );
}
