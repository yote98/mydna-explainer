import { NextRequest, NextResponse } from 'next/server';
import { validateTranslateRequest, ErrorResponse } from '@/lib/schema';
import { translateReport, checkForDisallowedIntent } from '@/lib/llm';
import { ZodError } from 'zod';

// Prevent logging of sensitive data
const SAFE_LOG = (message: string, meta?: Record<string, unknown>) => {
  // Only log safe metadata, never the actual report text
  console.log(`[translate] ${message}`, meta ? JSON.stringify(meta) : '');
};

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  try {
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

    const { text } = validatedRequest;

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

    // Check if LLM API key is configured
    if (!process.env.LLM_API_KEY) {
      SAFE_LOG('LLM API key not configured', { requestId });
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Service not configured', 
          details: 'LLM API key is not set. Please configure the LLM_API_KEY environment variable.'
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Translate the report
    const result = await translateReport(text);

    SAFE_LOG('Request completed successfully', {
      requestId,
      entitiesFound: result.extracted_entities.length,
      refusals: result.refusals.length,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
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
