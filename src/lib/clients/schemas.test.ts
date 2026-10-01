import { describe, expect, it } from "vitest";

import { clientSchema } from "./schemas";

describe("clientSchema", () => {
  it("accepts a name with no email", () => {
    const result = clientSchema.safeParse({ name: "Acme Inc." });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "Acme Inc.", email: undefined });
  });

  it("trims the name", () => {
    const result = clientSchema.safeParse({ name: "  Acme Inc.  " });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Acme Inc.");
  });

  it("rejects an empty name", () => {
    const result = clientSchema.safeParse({ name: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 200 characters", () => {
    const result = clientSchema.safeParse({ name: "a".repeat(201) });

    expect(result.success).toBe(false);
  });

  it("normalizes an empty-string email to undefined", () => {
    const result = clientSchema.safeParse({ name: "Acme Inc.", email: "" });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBeUndefined();
  });

  it("normalizes a whitespace-only email to undefined", () => {
    const result = clientSchema.safeParse({ name: "Acme Inc.", email: "   " });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBeUndefined();
  });

  it("trims a valid email", () => {
    const result = clientSchema.safeParse({
      name: "Acme Inc.",
      email: "  john@acme.com  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("john@acme.com");
  });

  it("rejects an invalid email", () => {
    const result = clientSchema.safeParse({
      name: "Acme Inc.",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });
});
