export type WidgetBootstrapConfig = {
  projectKey: string;
  apiBaseUrl: string;
};

/**
 * Reads the embedding <script> tag's own attributes: `data-project-key`
 * for the project, and the script's own `src` origin as the API base —
 * the widget calls back to wherever it was loaded from, never the host
 * page's own origin.
 */
export function parseWidgetBootstrap(scriptEl: {
  dataset: { projectKey?: string };
  src: string;
}): WidgetBootstrapConfig | null {
  const projectKey = scriptEl.dataset.projectKey?.trim();

  if (!projectKey) {
    return null;
  }

  let apiBaseUrl: string;

  try {
    apiBaseUrl = new URL(scriptEl.src).origin;
  } catch {
    return null;
  }

  return { projectKey, apiBaseUrl };
}

/**
 * Finds the <script> tag that loaded this widget bundle.
 * `document.currentScript` is reliable for a classic, synchronously
 * executing script (which is how the widget is meant to be embedded);
 * the data-attribute query is a fallback for any environment where
 * currentScript is unavailable by the time this runs.
 */
export function findWidgetScriptElement(doc: Document): HTMLScriptElement | null {
  if (doc.currentScript && doc.currentScript.tagName === "SCRIPT") {
    return doc.currentScript as HTMLScriptElement;
  }

  const candidates = doc.querySelectorAll<HTMLScriptElement>("script[data-project-key]");
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}
