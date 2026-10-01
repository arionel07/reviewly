import { z } from "zod";

/**
 * The `client` table only has `name` and an optional `email` (see
 * src/db/schema/clients.ts) — create and update use the exact same shape,
 * so there is a single schema rather than separate create/update ones
 * that would just duplicate it under different names.
 */
export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a client name.")
    .max(200, "Name must be 200 characters or fewer."),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.email("Enter a valid email address.").optional()),
});

export type ClientInput = z.infer<typeof clientSchema>;
