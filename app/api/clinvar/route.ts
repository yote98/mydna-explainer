import { NextRequest, NextResponse } from 'next/server';
import { validateClinvarRequest, ErrorResponse } from '@/lib/schema';
import { lookupClinVar } from '@/lib/clinvar';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
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

    // Perform lookup
    const result = await lookupClinVar(query);

    // Set cache headers for successful responses
    const headers: HeadersInit = {
      'Cache-Control': 'public, max-age=300', // 5 minutes
    };

    return NextResponse.json(result, { headers });

  } catch (error) {
    console.error('ClinVar API error:', error);

    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Failed to lookup variant',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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
