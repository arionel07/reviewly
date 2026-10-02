/**
 * The small boundary `ReviewlyWidget` talks to for screenshots — it never
 * references html2canvas (or any other capture library) directly, so a
 * future replacement only needs a new `ScreenshotProvider`, not any
 * change to widget lifecycle code. See `Html2CanvasScreenshotProvider`
 * for the only implementation.
 */
export type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type CaptureOptions = {
  /** Element to exclude from the capture — the widget's own Shadow DOM host. */
  ignoreElement?: Element;
  /** Viewport-relative rect of the selected element, to mark in the capture. */
  highlightRect?: HighlightRect;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
};

export type CaptureResult = {
  blob: Blob;
  contentType: "image/webp" | "image/png";
};

export interface ScreenshotProvider {
  capture(options: CaptureOptions): Promise<CaptureResult>;
}
