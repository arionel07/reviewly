import { describe, expect, it } from "vitest";

import { generateProjectPublicKey } from "./public-key";

describe("generateProjectPublicKey", () => {
  it("is prefixed and long enough to make collisions practically negligible", () => {
    const key = generateProjectPublicKey();

    expect(key.startsWith("pk_")).toBe(true);
    expect(key.length).toBeGreaterThanOrEqual(32);
  });

  it("is not derived from any project name (same call, different keys)", () => {
    const first = generateProjectPublicKey();
    const second = generateProjectPublicKey();

    expect(first).not.toBe(second);
  });

  it("generates practically unique keys across many calls", () => {
    const keys = new Set(Array.from({ length: 1000 }, () => generateProjectPublicKey()));

    expect(keys.size).toBe(1000);
  });
});
