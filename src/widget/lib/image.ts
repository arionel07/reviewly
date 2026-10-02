const MAX_SCREENSHOT_WIDTH = 1600;
const MAX_SCREENSHOT_HEIGHT = 1200;
const WEBP_QUALITY = 0.82;
const PNG_QUALITY = 0.92;

let cachedWebpSupport: boolean | null = null;

/**
 * Canvas-level WebP *encoding* support (not just decoding) varies enough
 * across browsers/engines that feature detection is safer than a
 * User-Agent sniff — the standard synchronous pattern: a canvas that
 * actually encoded as WebP returns a data URL starting with that MIME
 * type; one that silently fell back to PNG does not.
 */
export function supportsWebpEncoding(doc: Document = document): boolean {
  if (cachedWebpSupport !== null) {
    return cachedWebpSupport;
  }

  try {
    const canvas = doc.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    cachedWebpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    cachedWebpSupport = false;
  }

  return cachedWebpSupport;
}

/** Test-only: clear the cached feature-detection result. */
export function resetWebpSupportCache(): void {
  cachedWebpSupport = null;
}

/**
 * Scales a canvas down to fit within the given bounds, preserving aspect
 * ratio. Returns the same canvas unchanged if it already fits — most
 * viewport screenshots will, since viewports rarely exceed these bounds.
 */
export function resizeCanvasToFit(
  canvas: HTMLCanvasElement,
  maxWidth: number = MAX_SCREENSHOT_WIDTH,
  maxHeight: number = MAX_SCREENSHOT_HEIGHT,
): HTMLCanvasElement {
  if (canvas.width <= maxWidth && canvas.height <= maxHeight) {
    return canvas;
  }

  const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const resized = canvas.ownerDocument.createElement("canvas");
  resized.width = Math.max(1, Math.round(canvas.width * scale));
  resized.height = Math.max(1, Math.round(canvas.height * scale));

  const ctx = resized.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
  return resized;
}

export type EncodedCanvas = { blob: Blob; contentType: "image/webp" | "image/png" };

/**
 * `canvas.toBlob` is callback-based; this just promisifies it and picks
 * WebP vs. PNG once per widget instance via `supportsWebpEncoding`.
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<EncodedCanvas> {
  const useWebp = supportsWebpEncoding(canvas.ownerDocument);
  const contentType = useWebp ? "image/webp" : "image/png";
  const quality = useWebp ? WEBP_QUALITY : PNG_QUALITY;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, contentType });
        } else {
          reject(new Error("Canvas could not be encoded to an image."));
        }
      },
      contentType,
      quality,
    );
  });
}
