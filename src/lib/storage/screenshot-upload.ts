import { nanoid } from "nanoid";

/**
 * Only these two content types are ever accepted for a feedback
 * screenshot — WebP is preferred (smaller output from the widget's own
 * canvas encoding), PNG is the fallback for browsers/canvases without
 * reliable WebP encoding support. Anything else (including SVG, which
 * can carry script content) is rejected before a key is ever generated.
 */
export const ALLOWED_SCREENSHOT_CONTENT_TYPES = ["image/webp", "image/png"] as const;
export type ScreenshotContentType = (typeof ALLOWED_SCREENSHOT_CONTENT_TYPES)[number];

const EXTENSION_BY_CONTENT_TYPE: Record<ScreenshotContentType, string> = {
  "image/webp": "webp",
  "image/png": "png",
};

export function isAllowedScreenshotContentType(value: string): value is ScreenshotContentType {
  return (ALLOWED_SCREENSHOT_CONTENT_TYPES as readonly string[]).includes(value);
}

/**
 * A generous ceiling, not a target — the widget already downsizes and
 * compresses the canvas before asking for upload authorization (see
 * src/widget/lib/image.ts), so a typical screenshot lands far under this.
 * This is what actually bounds the object R2 will ever store: the
 * presigned PUT URL is signed with this exact declared size as its
 * Content-Length (see r2-object-storage.ts), so a client can't send more
 * bytes than it declared here.
 */
export const MAX_SCREENSHOT_BYTES = 2_000_000;

const OBJECT_KEY_PREFIX = "workspaces";
const RANDOM_SEGMENT_LENGTH = 24;
const OBJECT_KEY_RANDOM_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Builds the one allowed shape for a feedback screenshot's R2 object key.
 * Never derived from feedback message text, author name/email, or
 * anything else that could leak sensitive content into an object path —
 * only the (internal, never client-supplied) organizationId and
 * projectId plus a fresh random id. The widget never chooses or sends a
 * key; this is the only place one is produced (see the upload
 * authorization route).
 */
export function generateScreenshotObjectKey(
  organizationId: string,
  projectId: string,
  contentType: ScreenshotContentType,
): string {
  const extension = EXTENSION_BY_CONTENT_TYPE[contentType];
  return `${OBJECT_KEY_PREFIX}/${organizationId}/projects/${projectId}/feedback/${nanoid(RANDOM_SEGMENT_LENGTH)}.${extension}`;
}

/**
 * The feedback submission route's only defense against an arbitrary or
 * cross-project R2 key being attached to a Feedback row: the key must
 * sit under exactly this project's (and its organization's) own prefix
 * and end in a random segment this module itself would have generated.
 * A key for a different project — or a handwritten one — fails this and
 * is rejected rather than silently accepted.
 */
export function screenshotKeyBelongsToProject(
  key: string,
  organizationId: string,
  projectId: string,
): boolean {
  const expectedPrefix = `${OBJECT_KEY_PREFIX}/${organizationId}/projects/${projectId}/feedback/`;

  if (!key.startsWith(expectedPrefix)) {
    return false;
  }

  const rest = key.slice(expectedPrefix.length);
  const dotIndex = rest.lastIndexOf(".");

  if (dotIndex <= 0) {
    return false;
  }

  const randomSegment = rest.slice(0, dotIndex);
  const extension = rest.slice(dotIndex + 1);

  return (
    OBJECT_KEY_RANDOM_SEGMENT_PATTERN.test(randomSegment) &&
    Object.values(EXTENSION_BY_CONTENT_TYPE).includes(extension)
  );
}
