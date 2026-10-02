const MAX_SELECTOR_LENGTH = 500;

function cssEscapeIdentifier(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  // Minimal fallback for environments without CSS.escape (e.g. older
  // test runners) — good enough for the ids/classes real pages use.
  return value.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

function isUniqueSelector(selector: string, root: ParentNode): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function classSelectorFor(element: Element): string | null {
  const classList = Array.from(element.classList).filter(Boolean);

  if (classList.length === 0) {
    return null;
  }

  return `${element.tagName.toLowerCase()}.${classList
    .slice(0, 2)
    .map(cssEscapeIdentifier)
    .join(".")}`;
}

function nthChildPath(element: Element, root: ParentNode): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== root && current.parentElement) {
    const parent: Element = current.parentElement;
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(current) + 1;
    segments.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);

    const candidate = segments.join(" > ");
    if (isUniqueSelector(candidate, root)) {
      return candidate.slice(0, MAX_SELECTOR_LENGTH);
    }

    current = parent;
  }

  return segments.join(" > ").slice(0, MAX_SELECTOR_LENGTH);
}

/**
 * Pragmatic Phase 1 selector strategy, in priority order: a stable id,
 * then a tag+class combination, then a structural nth-child path as a
 * last resort. Not a DOM-resilience engine — just something reasonably
 * stable and human-readable for a page that doesn't change shape often.
 */
export function generateSelector(element: Element, root: ParentNode = document): string {
  if (element.id) {
    const idSelector = `#${cssEscapeIdentifier(element.id)}`;
    if (isUniqueSelector(idSelector, root)) {
      return idSelector.slice(0, MAX_SELECTOR_LENGTH);
    }
  }

  const classSelector = classSelectorFor(element);
  if (classSelector && isUniqueSelector(classSelector, root)) {
    return classSelector.slice(0, MAX_SELECTOR_LENGTH);
  }

  return nthChildPath(element, root);
}
