// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  canvasToBlob,
  resetWebpSupportCache,
  resizeCanvasToFit,
  supportsWebpEncoding,
} from "./image";

afterEach(() => {
  resetWebpSupportCache();
  vi.restoreAllMocks();
});

describe("supportsWebpEncoding", () => {
  it("returns true when the canvas actually encodes as webp", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/webp;base64,AAAA",
    );

    expect(supportsWebpEncoding()).toBe(true);
  });

  it("returns false when the canvas silently falls back to png", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,AAAA",
    );

    expect(supportsWebpEncoding()).toBe(false);
  });

  it("returns false if toDataURL throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => {
      throw new Error("not implemented");
    });

    expect(supportsWebpEncoding()).toBe(false);
  });

  it("caches the result across calls", () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/webp;base64,AAAA");

    supportsWebpEncoding();
    supportsWebpEncoding();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("resizeCanvasToFit", () => {
  it("returns the same canvas when it already fits", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    expect(resizeCanvasToFit(canvas, 1600, 1200)).toBe(canvas);
  });

  it("scales down proportionally when it exceeds the bounds", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 3200;
    canvas.height = 2400;

    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);

    const resized = resizeCanvasToFit(canvas, 1600, 1200);

    expect(resized).not.toBe(canvas);
    expect(resized.width).toBe(1600);
    expect(resized.height).toBe(1200);
    expect(drawImage).toHaveBeenCalledWith(canvas, 0, 0, 1600, 1200);
  });

  it("falls back to the original canvas if a 2d context is unavailable", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 3200;
    canvas.height = 2400;

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    expect(resizeCanvasToFit(canvas, 1600, 1200)).toBe(canvas);
  });
});

describe("canvasToBlob", () => {
  it("encodes as webp when supported", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/webp;base64,AAAA",
    );

    const fakeBlob = new Blob(["fake"], { type: "image/webp" });
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => cb(fakeBlob));

    const canvas = document.createElement("canvas");
    const result = await canvasToBlob(canvas);

    expect(result.contentType).toBe("image/webp");
    expect(result.blob).toBe(fakeBlob);
  });

  it("falls back to png when webp encoding is unsupported", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,AAAA",
    );

    const fakeBlob = new Blob(["fake"], { type: "image/png" });
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => cb(fakeBlob));

    const canvas = document.createElement("canvas");
    const result = await canvasToBlob(canvas);

    expect(result.contentType).toBe("image/png");
  });

  it("rejects if the canvas fails to encode", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,AAAA",
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => cb(null));

    const canvas = document.createElement("canvas");
    await expect(canvasToBlob(canvas)).rejects.toThrow();
  });
});
