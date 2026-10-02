export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type Bucket = {
  count: number;
  windowStartedAt: number;
};

/**
 * A fixed-window counter kept in process memory. This is the simplest
 * implementation that fits the current deployment (a single Next.js
 * monolith, no Redis/queue infrastructure — see ARCHITECTURE.md's
 * "Explicitly out of scope" and AGENTS.md's instruction not to add
 * Redis/BullMQ broadly for a focused public-endpoint protection
 * mechanism). It is deliberately not distributed: if Reviewly is ever
 * deployed across multiple server instances/processes, each one tracks
 * its own counts, so the *effective* limit becomes (per-instance limit) ×
 * (instance count) rather than a single global ceiling. That is an
 * accepted tradeoff for this phase, not an oversight — a real
 * multi-instance deployment would need a shared store (e.g. Upstash
 * Redis) behind this exact same interface.
 */
export class MemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    const bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStartedAt >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStartedAt: now });
      return { allowed: true, remaining: this.limit - 1, retryAfterMs: 0 };
    }

    if (bucket.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.windowStartedAt + this.windowMs - now,
      };
    }

    bucket.count += 1;
    return { allowed: true, remaining: this.limit - bucket.count, retryAfterMs: 0 };
  }

  /** Test-only: drop all tracked state so each test starts clean. */
  reset(): void {
    this.buckets.clear();
  }
}
