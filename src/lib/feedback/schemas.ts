import { z } from "zod";

import { feedbackStatusValues } from "@/lib/feedback/status";

const ALLOWED_PAGE_URL_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Fields a workspace member fills in when creating feedback manually.
 * Low-level, browser-captured context (selector, viewport, userAgent,
 * screenshotUrl) is intentionally absent here — see
 * src/db/schema/feedback.ts — those only ever come from the widget and
 * aren't meaningful to type by hand. Create and edit share this schema:
 * the same fields are editable in both, since none of them represent
 * something the browser captured that a human typing them in could
 * misrepresent.
 */
export const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Enter the feedback message.")
    .max(5000, "Message must be 5000 characters or fewer."),
  pageUrl: z
    .string()
    .trim()
    .min(1, "Enter the page URL.")
    .pipe(z.url("Enter a valid page URL."))
    .refine((value) => {
      try {
        return ALLOWED_PAGE_URL_PROTOCOLS.has(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Page URL must start with http:// or https://"),
  authorName: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.string().max(200, "Name must be 200 characters or fewer.").optional()),
  authorEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.email("Enter a valid email address.").optional()),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const feedbackCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Enter a comment.")
    .max(5000, "Comment must be 5000 characters or fewer."),
});

export type FeedbackCommentInput = z.infer<typeof feedbackCommentSchema>;

export const feedbackStatusChangeSchema = z.object({
  status: z.enum(feedbackStatusValues),
});
