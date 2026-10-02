// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { extractElementText, normalizeText } from "./text";

describe("normalizeText", () => {
  it("collapses internal whitespace and newlines", () => {
    expect(normalizeText("  Make   this\n  button   bigger  ")).toBe(
      "Make this button bigger",
    );
  });
});

describe("extractElementText", () => {
  it("uses text content when present", () => {
    document.body.innerHTML = "<button>Sign up now</button>";
    const el = document.querySelector("button")!;

    expect(extractElementText(el)).toBe("Sign up now");
  });

  it("falls back to alt text for images with no text content", () => {
    document.body.innerHTML = '<img alt="Product screenshot" />';
    const el = document.querySelector("img")!;

    expect(extractElementText(el)).toBe("Product screenshot");
  });

  it("falls back to placeholder for empty inputs", () => {
    document.body.innerHTML = '<input placeholder="you@example.com" />';
    const el = document.querySelector("input")!;

    expect(extractElementText(el)).toBe("you@example.com");
  });

  it("falls back to aria-label when nothing else is available", () => {
    document.body.innerHTML = '<div aria-label="Close dialog"></div>';
    const el = document.querySelector("div")!;

    expect(extractElementText(el)).toBe("Close dialog");
  });

  it("returns an empty string when there is nothing to extract", () => {
    document.body.innerHTML = "<div></div>";
    const el = document.querySelector("div")!;

    expect(extractElementText(el)).toBe("");
  });

  it("caps the extracted text length", () => {
    document.body.innerHTML = `<button>${"a".repeat(1000)}</button>`;
    const el = document.querySelector("button")!;

    expect(extractElementText(el, 50)).toHaveLength(50);
  });
});
