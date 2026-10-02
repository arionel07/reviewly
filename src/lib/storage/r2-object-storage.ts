import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { readR2Env, type R2Env } from "@/lib/storage/env";
import type {
  ObjectStorage,
  PresignedGetUrlInput,
  PresignedPutUrlInput,
} from "@/lib/storage/object-storage";

const DEFAULT_PUT_EXPIRES_SECONDS = 120;
const DEFAULT_GET_EXPIRES_SECONDS = 600;

/**
 * Cloudflare R2 via its S3-compatible API. The presigned PUT is signed
 * with an explicit `ContentLength` (not just `ContentType`) — the AWS
 * SigV4 signature then covers that header, so the uploading client must
 * send exactly that many bytes or the PUT fails with a signature
 * mismatch. That's the enforcement mechanism for the file-size limit
 * validated in the upload-authorization route: the widget declares
 * `fileSize` from its own already-compressed Blob, that value is checked
 * against the ceiling, and the resulting signed URL then only accepts a
 * body of that exact size.
 */
export class R2ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(env: R2Env = readR2Env()) {
    this.bucketName = env.bucketName;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.accessKeyId,
        secretAccessKey: env.secretAccessKey,
      },
    });
  }

  async createPresignedPutUrl({
    key,
    contentType,
    contentLength,
    expiresInSeconds = DEFAULT_PUT_EXPIRES_SECONDS,
  }: PresignedPutUrlInput): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async createPresignedGetUrl({
    key,
    expiresInSeconds = DEFAULT_GET_EXPIRES_SECONDS,
  }: PresignedGetUrlInput): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

let singleton: ObjectStorage | null = null;

/**
 * The one place application code obtains an `ObjectStorage`. Lazily
 * constructed (and only on first real use) so R2 env vars are never
 * required just to import a module that happens to sit near this one.
 */
export function getObjectStorage(): ObjectStorage {
  if (!singleton) {
    singleton = new R2ObjectStorage();
  }

  return singleton;
}
