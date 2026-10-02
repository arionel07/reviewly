// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/widget/lib/html2canvas-loader", () => ({
  loadHtml2Canvas: vi.fn(),
}));
vi.mock("@/widget/lib/image", () => ({
  canvasToBlob: vi.fn(),
  resizeCanvasToFit: vi.fn((canvas: HTMLCanvasElement) => canvas),
}));

import { loadHtml2Canvas } from "@/widget/lib/html2canvas-loader";
import { canvasToBlob, resizeCanvasToFit } from "@/widget/lib/image";

import { Html2CanvasScreenshotProvider } from "./html2canvas-screenshot-provider";

const loadHtml2CanvasMock = vi.mocked(loadHtml2Canvas);
const canvasToBlobMock = vi.mocked(canvasToBlob);
const resizeCanvasToFitMock = vi.mocked(resizeCanvasToFit);

const baseOptions = { viewportWidth: 800, viewportHeight: 600, scrollX: 0, scrollY: 0 };

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("Html2CanvasScreenshotProvider", () => {
  it("loads html2canvas lazily via the given script base URL", async () => {
    const fakeCanvas = document.createElement("canvas");
    loadHtml2CanvasMock.mockResolvedValue(vi.fn().mockResolvedValue(fakeCanvas));
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/webp" });

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture(baseOptions);

    expect(loadHtml2Canvas).toHaveBeenCalledWith("https://app.example.com");
  });

  it("passes viewport crop options through to html2canvas", async () => {
    const fakeCanvas = document.createElement("canvas");
    const html2canvasFn = vi.fn().mockResolvedValue(fakeCanvas);
    loadHtml2CanvasMock.mockResolvedValue(html2canvasFn);
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/webp" });

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture({ ...baseOptions, scrollX: 10, scrollY: 20 });

    expect(html2canvasFn).toHaveBeenCalledWith(
      document.documentElement,
      expect.objectContaining({ x: 10, y: 20, width: 800, height: 600 }),
    );
  });

  it("adds a temporary highlight element and removes it after a successful capture", async () => {
    const fakeCanvas = document.createElement("canvas");
    loadHtml2CanvasMock.mockResolvedValue(vi.fn().mockResolvedValue(fakeCanvas));
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/webp" });

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture({
      ...baseOptions,
      highlightRect: { top: 10, left: 20, width: 100, height: 50 },
    });

    expect(document.body.querySelector(".reviewly-screenshot-highlight")).toBeNull();
  });

  it("removes the highlight element even when html2canvas throws", async () => {
    loadHtml2CanvasMock.mockResolvedValue(vi.fn().mockRejectedValue(new Error("boom")));

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");

    await expect(
      provider.capture({
        ...baseOptions,
        highlightRect: { top: 0, left: 0, width: 10, height: 10 },
      }),
    ).rejects.toThrow("boom");

    expect(document.body.querySelector(".reviewly-screenshot-highlight")).toBeNull();
  });

  it("never mutates the host page's styles — the highlight is a new, unrelated element", async () => {
    const fakeCanvas = document.createElement("canvas");
    loadHtml2CanvasMock.mockResolvedValue(vi.fn().mockResolvedValue(fakeCanvas));
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/webp" });

    const target = document.createElement("button");
    target.className = "hero-cta";
    document.body.appendChild(target);
    const originalStyle = target.getAttribute("style");

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture({
      ...baseOptions,
      highlightRect: target.getBoundingClientRect(),
    });

    expect(target.getAttribute("style")).toBe(originalStyle);
  });

  it("excludes the widget's own host element via ignoreElements", async () => {
    const fakeCanvas = document.createElement("canvas");
    const html2canvasFn = vi.fn().mockResolvedValue(fakeCanvas);
    loadHtml2CanvasMock.mockResolvedValue(html2canvasFn);
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/webp" });

    const widgetHost = document.createElement("div");
    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture({ ...baseOptions, ignoreElement: widgetHost });

    const options = html2canvasFn.mock.calls[0][1] as {
      ignoreElements: (el: Element) => boolean;
    };
    expect(options.ignoreElements(widgetHost)).toBe(true);
    expect(options.ignoreElements(document.body)).toBe(false);
  });

  it("resizes the canvas before encoding", async () => {
    const fakeCanvas = document.createElement("canvas");
    const resizedCanvas = document.createElement("canvas");
    loadHtml2CanvasMock.mockResolvedValue(vi.fn().mockResolvedValue(fakeCanvas));
    resizeCanvasToFitMock.mockReturnValue(resizedCanvas);
    canvasToBlobMock.mockResolvedValue({ blob: new Blob(), contentType: "image/png" });

    const provider = new Html2CanvasScreenshotProvider("https://app.example.com");
    await provider.capture(baseOptions);

    expect(resizeCanvasToFit).toHaveBeenCalledWith(fakeCanvas);
    expect(canvasToBlob).toHaveBeenCalledWith(resizedCanvas);
  });
});
