import type { NextRequest } from 'next/server';

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

// In-memory, per-process rate limiter (best-effort).
// Note: On serverless platforms this is per-instance, not global.
const buckets = new Map<string, number[]>();

function normalizeIp(ip: string): string {
  return ip.trim();
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    // XFF can be a comma-separated list; client is the first hop.
    const first = xff.split(',')[0];
    if (first) return normalizeIp(first);
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return normalizeIp(realIp);

  // Fallback: NextRequest doesn't always expose a stable IP in all runtimes.
  return 'unknown';
}

export function rateLimit(key: string, cfg: RateLimitConfig, now = Date.now()): RateLimitResult {
  const windowStart = now - cfg.windowMs;
  const arr = buckets.get(key) || [];

  // Drop old entries
  const fresh = arr.filter((t) => t > windowStart);
  const used = fresh.length;

  if (used >= cfg.max) {
    const oldest = fresh[0] ?? now;
    const resetMs = Math.max(0, cfg.windowMs - (now - oldest));
    buckets.set(key, fresh);
    return {
      allowed: false,
      limit: cfg.max,
      remaining: 0,
      resetMs,
    };
  }

  fresh.push(now);
  buckets.set(key, fresh);

  const remaining = Math.max(0, cfg.max - fresh.length);
  const oldest = fresh[0] ?? now;
  const resetMs = Math.max(0, cfg.windowMs - (now - oldest));

  return {
    allowed: true,
    limit: cfg.max,
    remaining,
    resetMs,
  };
}

