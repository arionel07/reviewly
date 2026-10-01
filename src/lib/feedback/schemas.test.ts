import { describe, expect, it } from "vitest";

import { feedbackCommentSchema, feedbackSchema, feedbackStatusChangeSchema } from "./schemas";

describe("feedbackSchema", () => {
  const base = {
    message: "The pricing page is broken on mobile.",
    pageUrl: "https://staging.acme.com/pricing",
  };

  it("accepts the minimum required fields", () => {
    const result = feedbackSchema.safeParse(base);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      ...base,
      authorName: undefined,
      authorEmail: undefined,
    });
  });

  it("trims the message", () => {
    const result = feedbackSchema.safeParse({ ...base, message: "  Broken layout  " });

    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("Broken layout");
  });

  it("rejects an empty message", () => {
    const result = feedbackSchema.safeParse({ ...base, message: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a message longer than 5000 characters", () => {
    const result = feedbackSchema.safeParse({ ...base, message: "a".repeat(5001) });

    expect(result.success).toBe(false);
  });

  describe("pageUrl", () => {
    it("rejects an empty page URL", () => {
      const result = feedbackSchema.safeParse({ ...base, pageUrl: "" });

      expect(result.success).toBe(false);
    });

    it("does not auto-correct a malformed URL", () => {
      const result = feedbackSchema.safeParse({ ...base, pageUrl: "acme.com/pricing" });

      expect(result.success).toBe(false);
    });

    it.each(["javascript:alert(1)", "data:text/html,<script>", "file:///etc/passwd"])(
      "rejects unsafe protocol %s",
      (pageUrl) => {
        const result = feedbackSchema.safeParse({ ...base, pageUrl });

        expect(result.success).toBe(false);
      },
    );
  });

  describe("authorName / authorEmail", () => {
    it("normalizes empty strings to undefined", () => {
      const result = feedbackSchema.safeParse({ ...base, authorName: "", authorEmail: "" });

      expect(result.success).toBe(true);
      expect(result.data?.authorName).toBeUndefined();
      expect(result.data?.authorEmail).toBeUndefined();
    });

    it("trims a provided name", () => {
      const result = feedbackSchema.safeParse({ ...base, authorName: "  Jane Client  " });

      expect(result.success).toBe(true);
      expect(result.data?.authorName).toBe("Jane Client");
    });

    it("rejects an invalid email", () => {
      const result = feedbackSchema.safeParse({ ...base, authorEmail: "not-an-email" });

      expect(result.success).toBe(false);
    });

    it("accepts a valid email", () => {
      const result = feedbackSchema.safeParse({ ...base, authorEmail: "jane@acme.com" });

      expect(result.success).toBe(true);
      expect(result.data?.authorEmail).toBe("jane@acme.com");
    });
  });
});

describe("feedbackCommentSchema", () => {
  it("accepts a non-empty body", () => {
    const result = feedbackCommentSchema.safeParse({ body: "Looks good now, thanks." });

    expect(result.success).toBe(true);
  });

  it("trims the body", () => {
    const result = feedbackCommentSchema.safeParse({ body: "  Fixed.  " });

    expect(result.data?.body).toBe("Fixed.");
  });

  it("rejects an empty comment", () => {
    const result = feedbackCommentSchema.safeParse({ body: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 5000 characters", () => {
    const result = feedbackCommentSchema.safeParse({ body: "a".repeat(5001) });

    expect(result.success).toBe(false);
  });
});

describe("feedbackStatusChangeSchema", () => {
  it("accepts each real status value", () => {
    for (const status of ["open", "in_progress", "resolved", "reopened"]) {
      expect(feedbackStatusChangeSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects a status outside the current enum", () => {
    expect(feedbackStatusChangeSchema.safeParse({ status: "approved" }).success).toBe(false);
    expect(feedbackStatusChangeSchema.safeParse({ status: "closed" }).success).toBe(false);
  });
});
