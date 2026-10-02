import { z } from "zod";

import {
  ALLOWED_SCREENSHOT_CONTENT_TYPES,
  MAX_SCREENSHOT_BYTES,
} from "@/lib/storage/screenshot-upload";

const ALLOWED_PAGE_URL_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Shape-only check on a screenshot object key the widget echoes back from
 * the upload-authorization response. This never grants trust by itself —
 * the feedback route still requires the key to fall under the resolved
 * project's own prefix (see screenshotKeyBelongsToProject) before it's
 * ever persisted; this regex only rejects obviously malformed input
 * before that check runs.
 */
const screenshotKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^workspaces\/[^/]+\/projects\/[^/]+\/feedback\/[A-Za-z0-9_-]+\.(webp|png)$/);

/**
 * Matches generateProjectPublicKey's shape (pk_ + nanoid's url-safe
 * alphabet) — checked before ever reaching a database query, the same
 * way isUuid guards route params elsewhere.
 */
export const publicKeySchema = z
  .string()
  .trim()
  .min(1, "Missing project key.")
  .max(100, "Invalid project key.")
  .regex(/^pk_[A-Za-z0-9_-]+$/, "Invalid project key.");

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

/**
 * What the widget is allowed to send when submitting feedback. Only
 * fields listed here can ever reach the database — organizationId,
 * projectId, status, authorUserId, and screenshotUrl are deliberately
 * absent, so even a malicious payload carrying those keys has them
 * silently dropped by Zod rather than passed through.
 */
export const widgetFeedbackSchema = z.object({
  projectKey: publicKeySchema,
  message: z
    .string()
    .trim()
    .min(1, "Enter feedback.")
    .max(5000, "Message must be 5000 characters or fewer."),
  pageUrl: z
    .string()
    .trim()
    .min(1, "Missing page URL.")
    .pipe(z.url("Invalid page URL."))
    .refine((value) => {
      try {
        return ALLOWED_PAGE_URL_PROTOCOLS.has(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Page URL must use http or https."),
  elementText: optionalTrimmed(500),
  selector: optionalTrimmed(500),
  // Optional: set only when the widget successfully captured and
  // uploaded a screenshot. Absent (not an empty string) whenever capture
  // or upload failed — see src/widget/widget.ts — so feedback submission
  // is never blocked on having one.
  screenshotKey: screenshotKeySchema.optional(),
  viewportWidth: z.number().int().positive().max(20000).optional(),
  viewportHeight: z.number().int().positive().max(20000).optional(),
  userAgent: optionalTrimmed(500),
});

export type WidgetFeedbackInput = z.infer<typeof widgetFeedbackSchema>;

/**
 * What the widget sends to request upload authorization — only the
 * minimal safe metadata needed to validate and sign a PUT URL. No key or
 * path of any kind: the object key is always server-generated (see
 * src/lib/storage/screenshot-upload.ts).
 */
export const widgetUploadAuthorizationSchema = z.object({
  projectKey: publicKeySchema,
  contentType: z.enum(ALLOWED_SCREENSHOT_CONTENT_TYPES),
  fileSize: z.number().int().positive().max(MAX_SCREENSHOT_BYTES),
});

export type WidgetUploadAuthorizationInput = z.infer<
  typeof widgetUploadAuthorizationSchema
>;
