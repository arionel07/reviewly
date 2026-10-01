const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Postgres throws (not just "no rows") when a non-UUID string is compared
 * against a `uuid` column — which a route param or query string can
 * easily be. Checking the shape first turns a malformed id into a clean
 * "not found" instead of a crash.
 */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
