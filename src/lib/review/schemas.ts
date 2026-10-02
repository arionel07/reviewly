import { z } from "zod";

import { isValidRawReviewTokenFormat } from "@/lib/review/token";

export const rawReviewTokenSchema = z
  .string()
  .trim()
  .refine(isValidRawReviewTokenFormat, "Invalid review link.");

/**
 * What an anonymous client can submit as a comment. No authorUserId,
 * no organizationId, nothing resembling an internal id — a name and an
 * optional email are the only identity the client provides, matching
 * the existing anonymous-author columns on feedback_comment.
 */
export const clientCommentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(200, "Name must be 200 characters or fewer."),
  authorEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.email("Enter a valid email address.").optional()),
  body: z
    .string()
    .trim()
    .min(1, "Enter a comment.")
    .max(5000, "Comment must be 5000 characters or fewer."),
});

export type ClientCommentInput = z.infer<typeof clientCommentSchema>;
