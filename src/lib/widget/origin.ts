/**
 * Phase 1 origin enforcement. The schema has no `allowedDomains` field
 * (see docs/DECISIONS.md and the Phase 1 report) — the strongest check
 * available without a schema change is comparing the request's Origin
 * header against the project's single `websiteUrl`. This means a
 * project with multiple real domains (e.g. a staging and production
 * host) can only ever list one as "allowed" until that schema gap is
 * addressed — a documented limitation, not a silent compromise.
 */

const DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function parseOrigin(origin: string): URL | null {
  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

export function isDevOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  const parsed = parseOrigin(origin);
  return parsed !== null && DEV_HOSTNAMES.has(parsed.hostname);
}

export function originMatchesWebsite(origin: string | null, websiteUrl: string): boolean {
  if (!origin) {
    return false;
  }

  const originUrl = parseOrigin(origin);
  const websiteOriginUrl = parseOrigin(websiteUrl);

  if (!originUrl || !websiteOriginUrl) {
    return false;
  }

  return originUrl.origin === websiteOriginUrl.origin;
}

/**
 * The single origin policy used by every widget endpoint: the project's
 * configured website, or localhost/127.0.0.1 at any port for local
 * development. Never widened for production domains — only the literal
 * dev hostnames are exempt.
 *
 * A *missing* Origin header is also allowed, deliberately: per the Fetch
 * spec, browsers only omit Origin on a same-origin "safe" request (a
 * plain GET) and always attach a real one to any genuinely cross-origin
 * request or unsafe method (POST) — which is exactly the case this
 * check needs to catch, and can't be spoofed by a page's own
 * JavaScript. So an absent Origin never represents a cross-site caller
 * slipping through; it only means the request wasn't cross-origin to
 * begin with (e.g. the widget happens to be served from the same host
 * as the API, as in local dev).
 */
export function isOriginAllowedForProject(
  origin: string | null,
  websiteUrl: string,
): boolean {
  if (origin === null) {
    return true;
  }

  if (isDevOrigin(origin)) {
    return true;
  }

  return originMatchesWebsite(origin, websiteUrl);
}
