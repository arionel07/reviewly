import { describe, expect, it } from "vitest";

import { projectSchema } from "./schemas";

const validUuid = "123e4567-e89b-12d3-a456-426614174000";

describe("projectSchema", () => {
  const base = {
    name: "Acme Website Redesign",
    clientId: validUuid,
    websiteUrl: "https://staging.acme.com",
    status: "draft" as const,
  };

  it("accepts valid input", () => {
    const result = projectSchema.safeParse(base);

    expect(result.success).toBe(true);
  });

  it("trims the name", () => {
    const result = projectSchema.safeParse({ ...base, name: "  Acme Site  " });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Acme Site");
  });

  it("rejects an empty name", () => {
    const result = projectSchema.safeParse({ ...base, name: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 200 characters", () => {
    const result = projectSchema.safeParse({ ...base, name: "a".repeat(201) });

    expect(result.success).toBe(false);
  });

  it("rejects a clientId that isn't a UUID", () => {
    const result = projectSchema.safeParse({ ...base, clientId: "not-a-uuid" });

    expect(result.success).toBe(false);
  });

  it("rejects an empty clientId", () => {
    const result = projectSchema.safeParse({ ...base, clientId: "" });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = projectSchema.safeParse({ ...base, status: "cancelled" });

    expect(result.success).toBe(false);
  });

  describe("websiteUrl", () => {
    it("accepts https URLs", () => {
      const result = projectSchema.safeParse({
        ...base,
        websiteUrl: "https://acme.com/path?query=1",
      });

      expect(result.success).toBe(true);
    });

    it("accepts http URLs", () => {
      const result = projectSchema.safeParse({ ...base, websiteUrl: "http://acme.com" });

      expect(result.success).toBe(true);
    });

    it("trims surrounding whitespace", () => {
      const result = projectSchema.safeParse({
        ...base,
        websiteUrl: "  https://acme.com  ",
      });

      expect(result.success).toBe(true);
      expect(result.data?.websiteUrl).toBe("https://acme.com");
    });

    it("does not rewrite or auto-correct a malformed URL", () => {
      const result = projectSchema.safeParse({ ...base, websiteUrl: "acme.com" });

      expect(result.success).toBe(false);
    });

    it.each(["javascript:alert(1)", "data:text/html,<script>", "file:///etc/passwd", "ftp://acme.com"])(
      "rejects unsafe/non-web protocol %s",
      (websiteUrl) => {
        const result = projectSchema.safeParse({ ...base, websiteUrl });

        expect(result.success).toBe(false);
      },
    );
  });
});
