/**
 * Returns the configured canonical application origin. Email links must not
 * use the incoming Host header, so local development has an explicit safe
 * fallback while deployed environments should always set APP_URL.
 */
export function getCanonicalAppUrl(): string {
  const configured = process.env.APP_URL?.trim() || "http://localhost:3000";

  try {
    const url = new URL(configured);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "http://localhost:3000";
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

export function buildAppUrl(path: string): string {
  return `${getCanonicalAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
