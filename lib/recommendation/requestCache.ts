import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

/**
 * A simple in-memory LRU-style cache tailored for short-circuiting 
 * identical, rapid API requests.
 */
class RequestCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxItems: number;
  private ttlMs: number;

  constructor(maxItems = 1000, ttlSeconds = 30) {
    this.maxItems = maxItems;
    this.ttlMs = ttlSeconds * 1000;
  }

  private hashRequest(req: any): string {
    // Sort keys to ensure consistent hashing regardless of property order
    const str = JSON.stringify(req, Object.keys(req).sort());
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  get(req: any): T | null {
    const key = this.hashRequest(req);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end to simulate LRU behavior on read
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(req: any, value: T): void {
    const key = this.hashRequest(req);
    
    // Evict oldest if full (Map iterates in insertion order)
    if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs
    });
  }
}

// Module-level singleton cache restricted to 500 requests with a 30-second TTL
export const recommendationCache = new RequestCache<any>(500, 30);
