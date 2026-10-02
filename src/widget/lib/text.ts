const DEFAULT_MAX_LENGTH = 200;

/** Collapses whitespace/newlines so captured element text stays readable. */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Best-effort visible/semantic text for an arbitrary element: its own
 * text content first, then common attributes for elements that don't
 * have textContent worth showing (images, inputs).
 */
export function extractElementText(element: Element, maxLength = DEFAULT_MAX_LENGTH): string {
  const ownText = normalizeText(element.textContent ?? "");
  if (ownText) {
    return ownText.slice(0, maxLength);
  }

  if (element instanceof HTMLImageElement && element.alt) {
    return normalizeText(element.alt).slice(0, maxLength);
  }

  if (element instanceof HTMLInputElement) {
    const fallback = element.placeholder || element.value || "";
    if (fallback) {
      return normalizeText(fallback).slice(0, maxLength);
    }
  }

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) {
    return normalizeText(ariaLabel).slice(0, maxLength);
  }

  return "";
}
