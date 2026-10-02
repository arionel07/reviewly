import { describe, expect, it } from "vitest";

import { generateRawReviewToken } from "./token";
import { clientCommentSchema, rawReviewTokenSchema } from "./schemas";

describe("rawReviewTokenSchema", () => {
  it("accepts a well-formed token", () => {
    expect(rawReviewTokenSchema.safeParse(generateRawReviewToken()).success).toBe(true);
  });

  it("rejects a malformed token", () => {
    expect(rawReviewTokenSchema.safeParse("not-a-token").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(rawReviewTokenSchema.safeParse("").success).toBe(false);
  });
});

describe("clientCommentSchema", () => {
  const base = { authorName: "Jane Client", body: "Looks great now, thanks!" };

  it("accepts the minimal valid payload", () => {
    expect(clientCommentSchema.safeParse(base).success).toBe(true);
  });

  it("accepts an optional valid email", () => {
    expect(
      clientCommentSchema.safeParse({ ...base, authorEmail: "jane@example.com" }).success,
    ).toBe(true);
  });

  it("rejects an invalid email when provided", () => {
    expect(
      clientCommentSchema.safeParse({ ...base, authorEmail: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(clientCommentSchema.safeParse({ ...base, authorName: "" }).success).toBe(false);
  });

  it("rejects a missing comment body", () => {
    expect(clientCommentSchema.safeParse({ ...base, body: "" }).success).toBe(false);
  });

  it("rejects an oversized comment body", () => {
    expect(
      clientCommentSchema.safeParse({ ...base, body: "a".repeat(5001) }).success,
    ).toBe(false);
  });

  it("silently drops fields that aren't part of the schema, like authorUserId", () => {
    const result = clientCommentSchema.safeParse({
      ...base,
      authorUserId: "user_evil",
      organizationId: "org_evil",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("authorUserId");
    expect(result.data).not.toHaveProperty("organizationId");
  });
});
