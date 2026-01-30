import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';

// Force Node.js runtime
export const runtime = 'nodejs';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Processing timeout: 45 seconds (PDF parsing can be slow)
const PROCESSING_TIMEOUT_MS = 45000;

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
];

interface ExtractResponse {
  text: string;
  meta?: {
    pages?: number;
    chars: number;
    filename?: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
}

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

export async function POST(request: NextRequest): Promise<NextResponse<ExtractResponse | ErrorResponse>> {
  try {
    // Rate limiting: 10 file extractions per minute per IP (CPU intensive)
    const ip = getClientIp(request);
    const rl = rateLimit(`extract-text:${ip}`, { windowMs: 60_000, max: 10 });

    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: 'Too many file extractions. Please wait and try again.',
        },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': String(Math.ceil(rl.resetMs / 1000)),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large', details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type', details: `Allowed types: PDF, TXT` },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    }

    let extractedText = '';
    let pages: number | undefined;

    if (file.type === 'text/plain') {
      // Plain text file - read directly
      extractedText = await file.text();
    } else if (file.type === 'application/pdf') {
      // PDF file - use unpdf with timeout
      try {
        const { extractText } = await import('unpdf');

        // Read file as ArrayBuffer and create a copy to avoid detachment
        const originalBuffer = await file.arrayBuffer();
        const bufferCopy = new Uint8Array(originalBuffer).slice();

        // Extract text with timeout protection
        const result = await withTimeout(
          extractText(bufferCopy, { mergePages: true }),
          PROCESSING_TIMEOUT_MS,
          'PDF processing timed out. The file may be too large or complex.'
        );
        extractedText = result.text;
        pages = result.totalPages;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);

        return NextResponse.json(
          { error: 'Failed to parse PDF', details: 'The PDF file could not be read. It may be corrupted, password-protected, or contain only scanned images.' },
          {
            status: 400,
            headers: {
              'Cache-Control': 'no-store',
            }
          }
        );
      }
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Reduce excessive newlines
      .trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text found', details: 'The file appears to be empty or contains only images.' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          }
        }
      );
    }

    const response: ExtractResponse = {
      text: extractedText,
      meta: {
        chars: extractedText.length,
        filename: file.name,
        ...(pages !== undefined && { pages }),
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Text extraction error:', error);

    return NextResponse.json(
      { error: 'Failed to process file', details: 'An unexpected error occurred.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with multipart/form-data.' },
    {
      status: 405,
      headers: {
        'Cache-Control': 'no-store',
      }
    }
  );
}
