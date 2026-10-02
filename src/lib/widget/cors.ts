/**
 * CORS for the public widget endpoints only (src/app/api/widget/**) —
 * never applied globally. The widget runs on an arbitrary third-party
 * site, so its fetches are cross-origin by definition; the request's own
 * Origin is reflected back (never `*`) so the widget's JS can read the
 * response, including a rejection body. Reflecting Origin is not itself
 * an authorization decision — isOriginAllowedForProject (origin.ts) is
 * what actually accepts or rejects the request before any data is read
 * or written.
 */
export function buildWidgetCorsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
