export type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

/**
 * Read lazily (only when a storage operation is actually attempted), not
 * at module import time like `src/db/index.ts` does for DATABASE_URL —
 * R2 is optional for the app to build, lint, and run its non-widget-upload
 * tests, so importing this module (or anything that imports it) must not
 * require R2 credentials to exist.
 */
export function readR2Env(): R2Env {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "R2 storage is not configured: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}
