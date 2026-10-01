import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Acme Studio")).toBe("acme-studio");
  });

  it("strips characters that aren't letters or digits", () => {
    expect(slugify("Acme & Co. Studio!")).toBe("acme-co-studio");
  });

  it("trims leading and trailing hyphens produced by punctuation", () => {
    expect(slugify("  --Acme--  ")).toBe("acme");
  });

  it("collapses repeated separators into a single hyphen", () => {
    expect(slugify("Acme   Studio---Team")).toBe("acme-studio-team");
  });

  it("falls back to a default slug when nothing alphanumeric remains", () => {
    expect(slugify("!!!")).toBe("workspace");
    expect(slugify("")).toBe("workspace");
  });

  it("truncates very long names", () => {
    const longName = "a".repeat(100);
    expect(slugify(longName)).toHaveLength(48);
  });
});
