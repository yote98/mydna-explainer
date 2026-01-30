import { NextRequest, NextResponse } from 'next/server';
import { validateClinvarRequest, ErrorResponse } from '@/lib/schema';
import { lookupClinVar } from '@/lib/clinvar';
import { ZodError } from 'zod';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 20000;

async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(errorMessage));
        });
      }),
    ]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 20 requests per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`clinvar:${ip}`, { windowMs: 60_000, max: 20 });

    if (!rl.allowed) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: 'Too many ClinVar lookups. Please wait and try again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rl.resetMs / 1000)),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
          },
        }
      );
    }

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Validate
    try {
      validateClinvarRequest({ query });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Validation failed',
            details: error.errors.map(e => e.message).join(', ')
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Perform lookup with timeout
    const result = await withTimeout(
      lookupClinVar(query),
      REQUEST_TIMEOUT_MS,
      'ClinVar lookup timed out. The NCBI servers may be slow - please try again.'
    );

    // Set cache headers for successful responses
    const headers: HeadersInit = {
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'X-RateLimit-Limit': String(rl.limit),
      'X-RateLimit-Remaining': String(rl.remaining),
    };

    return NextResponse.json(result, { headers });

  } catch (error) {
    console.error('ClinVar API error:', error);

    const isTimeout = error instanceof Error && error.message.includes('timed out');

    return NextResponse.json<ErrorResponse>(
      {
        error: isTimeout ? 'Request timed out' : 'Failed to lookup variant',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

// Only allow GET
export async function POST() {
  return NextResponse.json<ErrorResponse>(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  );
}
