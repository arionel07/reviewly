import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;

/**
 * 32 random bytes, base64url-encoded without padding — always exactly 43
 * characters. Checked before any DB operation touches a client-supplied
 * token (see findProjectByReviewToken) so a malformed value never reaches
 * a hash lookup or an unsafe query.
 */
const RAW_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Generates a fresh raw review token. Cryptographically random (Node's
 * `crypto.randomBytes`, not `Math.random`) — this is the only thing
 * standing between a client and a project's feedback, so it must be
 * unguessable the same way a session token would be. The raw value is
 * returned to the caller exactly once; only its hash is ever persisted
 * (see hashReviewToken and src/lib/review/queries.ts).
 */
export function generateRawReviewToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/**
 * SHA-256 of the raw token, hex-encoded. Deterministic (same input →
 * same hash, always) so a presented token can be looked up by hash
 * without ever storing or comparing the raw value server-side after
 * issuance — the same reasoning as ADR-009 for review access tokens in
 * general. Not a password hash (no salt/stretching): the input is
 * already a full-entropy 256-bit random value, not a human-chosen
 * secret, so there is nothing a slow hash would protect against here
 * that the token's own entropy doesn't already provide.
 */
export function hashReviewToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Shape-only check — never a substitute for the hash lookup itself. */
export function isValidRawReviewTokenFormat(value: string): boolean {
  return RAW_TOKEN_PATTERN.test(value);
}

export function isReviewTokenExpired(
  expiresAt: Date | null,
  now: Date = new Date(),
): boolean {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}
