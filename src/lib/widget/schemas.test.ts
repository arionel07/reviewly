import { describe, expect, it } from "vitest";

import {
  publicKeySchema,
  widgetFeedbackSchema,
  widgetUploadAuthorizationSchema,
} from "./schemas";

describe("publicKeySchema", () => {
  it("accepts a well-formed key", () => {
    expect(publicKeySchema.safeParse("pk_abc123_XYZ-789").success).toBe(true);
  });

  it("rejects a key missing the pk_ prefix", () => {
    expect(publicKeySchema.safeParse("abc123").success).toBe(false);
  });

  it("rejects an empty key", () => {
    expect(publicKeySchema.safeParse("").success).toBe(false);
  });

  it("rejects a key with disallowed characters", () => {
    expect(publicKeySchema.safeParse("pk_abc 123").success).toBe(false);
    expect(publicKeySchema.safeParse("pk_abc;drop table").success).toBe(false);
  });
});

describe("widgetFeedbackSchema", () => {
  const base = {
    projectKey: "pk_abc123",
    message: "Make this button bigger",
    pageUrl: "https://acme.com/pricing",
  };

  it("accepts the minimal valid payload", () => {
    expect(widgetFeedbackSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an empty message", () => {
    expect(widgetFeedbackSchema.safeParse({ ...base, message: "   " }).success).toBe(false);
  });

  it("rejects a message longer than 5000 characters", () => {
    expect(
      widgetFeedbackSchema.safeParse({ ...base, message: "a".repeat(5001) }).success,
    ).toBe(false);
  });

  describe("pageUrl", () => {
    it("rejects a missing page URL", () => {
      expect(widgetFeedbackSchema.safeParse({ ...base, pageUrl: "" }).success).toBe(false);
    });

    it("rejects a malformed URL", () => {
      expect(
        widgetFeedbackSchema.safeParse({ ...base, pageUrl: "not a url" }).success,
      ).toBe(false);
    });

    it.each(["javascript:alert(1)", "data:text/html,<script>", "file:///etc/passwd"])(
      "rejects unsafe protocol %s",
      (pageUrl) => {
        expect(widgetFeedbackSchema.safeParse({ ...base, pageUrl }).success).toBe(false);
      },
    );

    it("accepts http as well as https", () => {
      expect(
        widgetFeedbackSchema.safeParse({ ...base, pageUrl: "http://localhost:3000/" }).success,
      ).toBe(true);
    });
  });

  it("caps selector/elementText/userAgent length", () => {
    const result = widgetFeedbackSchema.safeParse({
      ...base,
      selector: "a".repeat(600),
      elementText: "b".repeat(600),
      userAgent: "c".repeat(600),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an oversized viewport value", () => {
    expect(
      widgetFeedbackSchema.safeParse({ ...base, viewportWidth: 999_999 }).success,
    ).toBe(false);
  });

  it("silently drops fields that aren't part of the schema (status, ids, etc.)", () => {
    const result = widgetFeedbackSchema.safeParse({
      ...base,
      status: "resolved",
      organizationId: "org_evil",
      projectId: "00000000-0000-0000-0000-000000000000",
      authorUserId: "user_evil",
      screenshotUrl: "https://evil.example/fake.png",
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("status");
    expect(result.data).not.toHaveProperty("organizationId");
    expect(result.data).not.toHaveProperty("projectId");
    expect(result.data).not.toHaveProperty("authorUserId");
    expect(result.data).not.toHaveProperty("screenshotUrl");
  });

  describe("screenshotKey", () => {
    const validKey =
      "workspaces/org_abc/projects/00000000-0000-0000-0000-000000000000/feedback/abcDEF123-_.webp";

    it("accepts a well-formed server-generated key", () => {
      expect(
        widgetFeedbackSchema.safeParse({ ...base, screenshotKey: validKey }).success,
      ).toBe(true);
    });

    it("accepts a png key", () => {
      expect(
        widgetFeedbackSchema.safeParse({
          ...base,
          screenshotKey: validKey.replace(".webp", ".png"),
        }).success,
      ).toBe(true);
    });

    it("rejects a key with an unexpected extension", () => {
      expect(
        widgetFeedbackSchema.safeParse({
          ...base,
          screenshotKey: validKey.replace(".webp", ".svg"),
        }).success,
      ).toBe(false);
    });

    it("rejects a handwritten/arbitrary path", () => {
      expect(
        widgetFeedbackSchema.safeParse({ ...base, screenshotKey: "../../etc/passwd" }).success,
      ).toBe(false);
    });

    it("rejects a key missing the workspaces/ prefix", () => {
      expect(
        widgetFeedbackSchema.safeParse({
          ...base,
          screenshotKey: "projects/x/feedback/abc.webp",
        }).success,
      ).toBe(false);
    });

    it("is optional", () => {
      expect(widgetFeedbackSchema.safeParse(base).success).toBe(true);
    });
  });
});

describe("widgetUploadAuthorizationSchema", () => {
  const base = {
    projectKey: "pk_abc123",
    contentType: "image/webp",
    fileSize: 50_000,
  };

  it("accepts a well-formed request", () => {
    expect(widgetUploadAuthorizationSchema.safeParse(base).success).toBe(true);
  });

  it("accepts image/png", () => {
    expect(
      widgetUploadAuthorizationSchema.safeParse({ ...base, contentType: "image/png" }).success,
    ).toBe(true);
  });

  it("rejects an unsupported content type", () => {
    expect(
      widgetUploadAuthorizationSchema.safeParse({ ...base, contentType: "image/svg+xml" })
        .success,
    ).toBe(false);
  });

  it("rejects a non-image content type", () => {
    expect(
      widgetUploadAuthorizationSchema.safeParse({ ...base, contentType: "text/html" }).success,
    ).toBe(false);
  });

  it("rejects a file size over the ceiling", () => {
    expect(
      widgetUploadAuthorizationSchema.safeParse({ ...base, fileSize: 10_000_000 }).success,
    ).toBe(false);
  });

  it("rejects a zero or negative file size", () => {
    expect(widgetUploadAuthorizationSchema.safeParse({ ...base, fileSize: 0 }).success).toBe(
      false,
    );
    expect(widgetUploadAuthorizationSchema.safeParse({ ...base, fileSize: -1 }).success).toBe(
      false,
    );
  });

  it("rejects an invalid project key", () => {
    expect(
      widgetUploadAuthorizationSchema.safeParse({ ...base, projectKey: "not-a-key" }).success,
    ).toBe(false);
  });
});
