import { describe, expect, it } from "vitest";

import { buildFeedbackPayload } from "./payload";

describe("buildFeedbackPayload", () => {
  const base = {
    projectKey: "pk_abc123",
    message: "  Make this button bigger  ",
    pageUrl: "https://acme.com/pricing",
  };

  it("trims the message", () => {
    const payload = buildFeedbackPayload(base);

    expect(payload.message).toBe("Make this button bigger");
  });

  it("omits optional fields that were not provided", () => {
    const payload = buildFeedbackPayload(base);

    expect(payload.selector).toBeUndefined();
    expect(payload.elementText).toBeUndefined();
    expect(payload.viewportWidth).toBeUndefined();
    expect(payload.userAgent).toBeUndefined();
  });

  it("caps the message length", () => {
    const payload = buildFeedbackPayload({ ...base, message: "a".repeat(6000) });

    expect(payload.message).toHaveLength(5000);
  });

  it("caps selector and elementText length", () => {
    const payload = buildFeedbackPayload({
      ...base,
      selector: "a".repeat(1000),
      elementText: "b".repeat(1000),
    });

    expect(payload.selector).toHaveLength(500);
    expect(payload.elementText).toHaveLength(500);
  });

  it("rounds viewport dimensions to integers", () => {
    const payload = buildFeedbackPayload({
      ...base,
      viewportWidth: 1024.6,
      viewportHeight: 768.2,
    });

    expect(payload.viewportWidth).toBe(1025);
    expect(payload.viewportHeight).toBe(768);
  });

  it("never includes fields the caller didn't pass, like status or ids", () => {
    const payload = buildFeedbackPayload(base) as Record<string, unknown>;

    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("organizationId");
    expect(payload).not.toHaveProperty("projectId");
    expect(payload).not.toHaveProperty("authorUserId");
  });
});
