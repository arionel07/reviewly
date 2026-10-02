/**
 * The only boundary widget upload code (and, later, anything else that
 * reads/writes R2) talks to directly. Route Handlers must not construct
 * an S3 client or call `@aws-sdk/*` themselves — see
 * `src/lib/storage/r2-object-storage.ts` for the only implementation, and
 * `getObjectStorage()` for how callers obtain one. Keeping this as a
 * small interface (not the concrete R2 client) is what lets tests swap in
 * a fake implementation instead of needing real Cloudflare credentials or
 * network access.
 */
export interface PresignedPutUrlInput {
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
}

export interface PresignedGetUrlInput {
  key: string;
  expiresInSeconds?: number;
}

export interface ObjectStorage {
  createPresignedPutUrl(input: PresignedPutUrlInput): Promise<string>;
  createPresignedGetUrl(input: PresignedGetUrlInput): Promise<string>;
}
