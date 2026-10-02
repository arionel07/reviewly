import { describe, expect, it } from "vitest";

import {
  generateRawReviewToken,
  hashReviewToken,
  isReviewTokenExpired,
  isValidRawReviewTokenFormat,
} from "./token";

describe("generateRawReviewToken", () => {
  it("generates a token matching the expected format", () => {
    const token = generateRawReviewToken();
    expect(isValidRawReviewTokenFormat(token)).toBe(true);
  });

  it("generates a different token on every call", () => {
    const first = generateRawReviewToken();
    const second = generateRawReviewToken();
    expect(first).not.toBe(second);
  });

  it("is exactly 43 characters (32 random bytes, base64url, no padding)", () => {
    expect(generateRawReviewToken()).toHaveLength(43);
  });
});

describe("hashReviewToken", () => {
  it("produces the same hash for the same token", () => {
    const token = generateRawReviewToken();
    expect(hashReviewToken(token)).toBe(hashReviewToken(token));
  });

  it("produces a different hash for a different token", () => {
    const first = generateRawReviewToken();
    const second = generateRawReviewToken();
    expect(hashReviewToken(first)).not.toBe(hashReviewToken(second));
  });

  it("produces a 64-character hex digest (SHA-256)", () => {
    const hash = hashReviewToken(generateRawReviewToken());
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("never returns the raw token itself", () => {
    const token = generateRawReviewToken();
    expect(hashReviewToken(token)).not.toBe(token);
  });
});

describe("isValidRawReviewTokenFormat", () => {
  it("accepts a freshly generated token", () => {
    expect(isValidRawReviewTokenFormat(generateRawReviewToken())).toBe(true);
  });

  it.each([
    "",
    "short",
    "a".repeat(44),
    "a".repeat(42),
    "has spaces in it 12345678901234567890123",
    "has;sql`injection`attempt-chars-1234567890",
    "../../../etc/passwd-1234567890123456789012",
  ])("rejects malformed token %s", (value) => {
    expect(isValidRawReviewTokenFormat(value)).toBe(false);
  });
});

describe("isReviewTokenExpired", () => {
  it("is never expired when expiresAt is null", () => {
    expect(isReviewTokenExpired(null)).toBe(false);
  });

  it("is expired when expiresAt is in the past", () => {
    const now = new Date("2026-01-02T00:00:00Z");
    const expiresAt = new Date("2026-01-01T00:00:00Z");
    expect(isReviewTokenExpired(expiresAt, now)).toBe(true);
  });

  it("is expired exactly at the expiry instant", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isReviewTokenExpired(now, now)).toBe(true);
  });

  it("is not expired when expiresAt is in the future", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2026-01-02T00:00:00Z");
    expect(isReviewTokenExpired(expiresAt, now)).toBe(false);
  });
});
