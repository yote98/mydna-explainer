// Simple in-memory cache with TTL support

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number; // milliseconds
  
  constructor(defaultTTLSeconds: number = 300) { // 5 minutes default
    this.defaultTTL = defaultTTLSeconds * 1000;
  }
  
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }
  
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean up expired entries (call periodically in long-running processes)
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance for ClinVar cache (5 minute TTL)
export const clinvarCache = new MemoryCache(300);

// Rate limiting helper
class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Remove old timestamps
    this.timestamps = this.timestamps.filter(ts => ts > windowStart);
    
    return this.timestamps.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.timestamps.push(Date.now());
  }
  
  async waitForSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// NCBI recommends no more than 3 requests per second without API key
// With API key, up to 10 requests per second
export const ncbiRateLimiter = new RateLimiter(
  process.env.NCBI_API_KEY ? 10 : 3,
  1
);
