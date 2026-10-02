import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { widgetRateLimitKey } from "./widget-limits";

function fakeRequest(headers: Record<string, string>): NextRequest {
  const map = new Map(Object.entries(headers));
  return { headers: { get: (name: string) => map.get(name) ?? null } } as unknown as NextRequest;
}

describe("widgetRateLimitKey", () => {
  it("combines the project key with the first x-forwarded-for IP", () => {
    const key = widgetRateLimitKey(
      "pk_abc",
      fakeRequest({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }),
    );

    expect(key).toBe("pk_abc:203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const key = widgetRateLimitKey("pk_abc", fakeRequest({ "x-real-ip": "203.0.113.9" }));
    expect(key).toBe("pk_abc:203.0.113.9");
  });

  it("falls back to 'unknown' when no IP header is present", () => {
    const key = widgetRateLimitKey("pk_abc", fakeRequest({}));
    expect(key).toBe("pk_abc:unknown");
  });

  it("scopes the key per project — two projects behind the same IP differ", () => {
    const req = fakeRequest({ "x-forwarded-for": "203.0.113.5" });
    expect(widgetRateLimitKey("pk_a", req)).not.toBe(widgetRateLimitKey("pk_b", req));
  });
});
