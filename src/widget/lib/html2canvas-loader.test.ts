// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadHtml2Canvas, resetHtml2CanvasLoaderForTests } from "./html2canvas-loader";

function getAppendedScript(): HTMLScriptElement {
  const script = document.head.querySelector("script");
  if (!script) throw new Error("no script was appended");
  return script;
}

beforeEach(() => {
  resetHtml2CanvasLoaderForTests();
  document.head.innerHTML = "";
  delete (window as { html2canvas?: unknown }).html2canvas;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadHtml2Canvas", () => {
  it("resolves immediately if html2canvas is already on window", async () => {
    const fn = vi.fn();
    (window as unknown as { html2canvas: unknown }).html2canvas = fn;

    const result = await loadHtml2Canvas("https://app.example.com");

    expect(result).toBe(fn);
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("appends a script tag pointing at the widget's own public path", () => {
    void loadHtml2Canvas("https://app.example.com");

    const script = getAppendedScript();
    expect(script.src).toBe("https://app.example.com/widget/html2canvas.min.js");
  });

  it("resolves with window.html2canvas once the script fires 'load'", async () => {
    const promise = loadHtml2Canvas("https://app.example.com");
    const fn = vi.fn();
    (window as unknown as { html2canvas: unknown }).html2canvas = fn;

    getAppendedScript().dispatchEvent(new Event("load"));

    expect(await promise).toBe(fn);
  });

  it("rejects if the script fires 'error'", async () => {
    const promise = loadHtml2Canvas("https://app.example.com");
    getAppendedScript().dispatchEvent(new Event("error"));

    await expect(promise).rejects.toThrow();
  });

  it("reuses the same in-flight promise for concurrent calls", () => {
    const first = loadHtml2Canvas("https://app.example.com");
    const second = loadHtml2Canvas("https://app.example.com");

    expect(first).toBe(second);
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
  });

  it("allows a fresh attempt after a failed load", async () => {
    const firstAttempt = loadHtml2Canvas("https://app.example.com");
    getAppendedScript().dispatchEvent(new Event("error"));
    await expect(firstAttempt).rejects.toThrow();

    document.head.innerHTML = "";
    const secondAttempt = loadHtml2Canvas("https://app.example.com");
    const fn = vi.fn();
    (window as unknown as { html2canvas: unknown }).html2canvas = fn;
    getAppendedScript().dispatchEvent(new Event("load"));

    expect(await secondAttempt).toBe(fn);
  });
});
