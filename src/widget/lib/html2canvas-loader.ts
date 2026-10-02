export type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    html2canvas?: Html2CanvasFn;
  }
}

let loadingPromise: Promise<Html2CanvasFn> | null = null;

/**
 * Loads html2canvas as a separate, lazily-fetched `<script>` rather than
 * a static import — see the Widget Phase 2 report's "html2canvas/
 * lazy-load strategy" section for why. In short: the widget bundle is
 * built as a single IIFE (ADR-007), and Rollup/Vite cannot code-split a
 * `import()` out of an IIFE build — there is no module loader at runtime
 * for it to load a second chunk through, so a dynamic `import()` here
 * would just get inlined into the same bundle at build time, defeating
 * the point. Loading a classic script tag on demand is the one mechanism
 * that gets a real, deferred network fetch out of an IIFE-only build:
 * `widget.js` stays small until a visitor actually selects an element,
 * at which point this fetches the prebuilt html2canvas UMD bundle
 * (`/widget/html2canvas.min.js`, copied from the upstream package by the
 * `widget:build` script) from the same origin `widget.js` itself was
 * loaded from.
 */
export function loadHtml2Canvas(scriptBaseUrl: string): Promise<Html2CanvasFn> {
  if (typeof window !== "undefined" && window.html2canvas) {
    return Promise.resolve(window.html2canvas);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise<Html2CanvasFn>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${scriptBaseUrl}/widget/html2canvas.min.js`;
    script.async = true;

    script.addEventListener("load", () => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
      } else {
        reject(new Error("html2canvas did not initialize."));
      }
    });

    script.addEventListener("error", () => {
      reject(new Error("Could not load the screenshot library."));
    });

    document.head.appendChild(script);
  }).catch((error) => {
    // A failed load must not permanently wedge the widget: the next
    // selection gets a fresh attempt instead of reusing a rejected promise.
    loadingPromise = null;
    throw error;
  });

  return loadingPromise;
}

/** Test-only: clear the module-level cache between test cases. */
export function resetHtml2CanvasLoaderForTests(): void {
  loadingPromise = null;
}
