import { describe, expect, it } from "vitest";

import { MemoryRateLimiter } from "./memory-rate-limiter";

describe("MemoryRateLimiter", () => {
  it("allows requests up to the limit within the window", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    const now = 1_000;

    expect(limiter.check("key", now).allowed).toBe(true);
    expect(limiter.check("key", now).allowed).toBe(true);
    expect(limiter.check("key", now).allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const limiter = new MemoryRateLimiter(2, 60_000);
    const now = 1_000;

    limiter.check("key", now);
    limiter.check("key", now);
    const result = limiter.check("key", now);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const now = 1_000;

    expect(limiter.check("project-a:1.2.3.4", now).allowed).toBe(true);
    expect(limiter.check("project-b:1.2.3.4", now).allowed).toBe(true);
    expect(limiter.check("project-a:1.2.3.4", now).allowed).toBe(false);
  });

  it("resets the window once it elapses", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);

    expect(limiter.check("key", 0).allowed).toBe(true);
    expect(limiter.check("key", 30_000).allowed).toBe(false);
    expect(limiter.check("key", 60_001).allowed).toBe(true);
  });

  it("reports decreasing remaining counts", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    const now = 1_000;

    expect(limiter.check("key", now).remaining).toBe(2);
    expect(limiter.check("key", now).remaining).toBe(1);
    expect(limiter.check("key", now).remaining).toBe(0);
  });

  it("reset() clears tracked state", () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const now = 1_000;

    limiter.check("key", now);
    expect(limiter.check("key", now).allowed).toBe(false);

    limiter.reset();
    expect(limiter.check("key", now).allowed).toBe(true);
  });
});
