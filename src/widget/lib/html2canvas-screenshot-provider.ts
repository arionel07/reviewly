import { canvasToBlob, resizeCanvasToFit } from "@/widget/lib/image";
import { loadHtml2Canvas } from "@/widget/lib/html2canvas-loader";
import type { CaptureOptions, CaptureResult, ScreenshotProvider } from "@/widget/lib/screenshot";

const HIGHLIGHT_CLASS = "reviewly-screenshot-highlight";

/**
 * The only `ScreenshotProvider` implementation. Captures the current
 * viewport of the host page — never the full scrollable document (per
 * the Phase 2 scope) — and, when a selected element's rect is given,
 * draws a temporary highlight outline directly into the host page's
 * light DOM just long enough for html2canvas to render it, then removes
 * it immediately afterward, success or failure, so the host page is
 * never left in a modified state.
 */
export class Html2CanvasScreenshotProvider implements ScreenshotProvider {
  constructor(private readonly scriptBaseUrl: string) {}

  async capture(options: CaptureOptions): Promise<CaptureResult> {
    const html2canvas = await loadHtml2Canvas(this.scriptBaseUrl);

    const highlightEl = options.highlightRect
      ? this.createHighlightElement(options.highlightRect)
      : null;

    if (highlightEl) {
      document.body.appendChild(highlightEl);
    }

    try {
      const canvas = await html2canvas(document.documentElement, {
        x: options.scrollX,
        y: options.scrollY,
        width: options.viewportWidth,
        height: options.viewportHeight,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scale: 1,
        useCORS: true,
        logging: false,
        ignoreElements: (el: Element) => el === options.ignoreElement,
      });

      const resized = resizeCanvasToFit(canvas);
      return canvasToBlob(resized);
    } finally {
      highlightEl?.remove();
    }
  }

  private createHighlightElement(rect: CaptureOptions["highlightRect"]): HTMLDivElement {
    const el = document.createElement("div");
    el.className = HIGHLIGHT_CLASS;
    el.style.position = "fixed";
    el.style.top = `${rect!.top}px`;
    el.style.left = `${rect!.left}px`;
    el.style.width = `${rect!.width}px`;
    el.style.height = `${rect!.height}px`;
    el.style.border = "2px solid #6366f1";
    el.style.borderRadius = "2px";
    el.style.boxShadow = "0 0 0 2px rgba(99, 102, 241, 0.35)";
    el.style.pointerEvents = "none";
    el.style.zIndex = "2147483647";
    el.style.margin = "0";
    el.style.padding = "0";
    el.style.background = "transparent";
    return el;
  }
}
