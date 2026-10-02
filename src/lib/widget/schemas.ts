import { z } from "zod";

const ALLOWED_PAGE_URL_PROTOCOLS = new Set(["http:", "https:"]);

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
  // elementText has no column on `feedback` yet (see docs/DECISIONS.md
  // and the Phase 1 report) — accepted and shape-validated so the
  // widget's capture code isn't wasted once a column exists, but never
  // persisted.
  elementText: optionalTrimmed(500),
  selector: optionalTrimmed(500),
  viewportWidth: z.number().int().positive().max(20000).optional(),
  viewportHeight: z.number().int().positive().max(20000).optional(),
  userAgent: optionalTrimmed(500),
});

export type WidgetFeedbackInput = z.infer<typeof widgetFeedbackSchema>;
