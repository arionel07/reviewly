import { describe, expect, it } from "vitest";

import {
  createWorkspaceSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

describe("signUpSchema", () => {
  it("accepts a valid sign-up", () => {
    const result = signUpSchema.safeParse({
      name: "Arionel",
      email: "arionel@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("trims the name and email", () => {
    const result = signUpSchema.safeParse({
      name: "  Arionel  ",
      email: "  arionel@example.com  ",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "Arionel",
      email: "arionel@example.com",
    });
  });

  it("rejects a name that's too short", () => {
    const result = signUpSchema.safeParse({
      name: "A",
      email: "arionel@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      name: "Arionel",
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      name: "Arionel",
      email: "arionel@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts a valid sign-in", () => {
    const result = signInSchema.safeParse({
      email: "arionel@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = signInSchema.safeParse({
      email: "arionel@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });

    expect(result.success).toBe(false);
  });
});

describe("createWorkspaceSchema", () => {
  it("accepts a valid workspace name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "Acme Studio" });

    expect(result.success).toBe(true);
  });

  it("rejects a name that's too short", () => {
    const result = createWorkspaceSchema.safeParse({ name: "A" });

    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 80 characters", () => {
    const result = createWorkspaceSchema.safeParse({
      name: "a".repeat(81),
    });

    expect(result.success).toBe(false);
  });
});
