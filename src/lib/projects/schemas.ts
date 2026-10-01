import { z } from "zod";

import { projectStatusEnum } from "@/db/schema";

const ALLOWED_WEBSITE_PROTOCOLS = new Set(["http:", "https:"]);

export const projectStatusValues = projectStatusEnum.enumValues;

export type ProjectStatus = (typeof projectStatusValues)[number];

/**
 * Create and update use the exact same shape — the only difference is
 * which fields the form shows (create defaults `status` to "draft"
 * without rendering a status picker; edit shows and lets it change).
 */
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a project name.")
    .max(200, "Name must be 200 characters or fewer."),
  clientId: z
    .string()
    .trim()
    .min(1, "Select a client.")
    .pipe(z.uuid("Select a valid client.")),
  websiteUrl: z
    .string()
    .trim()
    .min(1, "Enter a website URL.")
    .pipe(z.url("Enter a valid website URL."))
    .refine((value) => {
      try {
        return ALLOWED_WEBSITE_PROTOCOLS.has(new URL(value).protocol);
      } catch {
        return false;
      }
    }, "Website URL must start with http:// or https://"),
  status: z.enum(projectStatusValues),
});

export type ProjectInput = z.infer<typeof projectSchema>;
