"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { createWorkspaceSchema } from "@/lib/auth/schemas";
import { slugify } from "@/lib/auth/slug";

type CreateWorkspaceResult = { error: string };

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message || "Could not create the workspace. Please try again.";
  }

  return "Could not create the workspace. Please try again.";
}

export async function createWorkspaceAction(
  input: unknown,
): Promise<CreateWorkspaceResult> {
  const parsed = createWorkspaceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a workspace name.",
    };
  }

  const requestHeaders = await headers();
  const name = parsed.data.name;
  const baseSlug = slugify(name);

  try {
    await auth.api.createOrganization({
      headers: requestHeaders,
      body: { name, slug: baseSlug },
    });
  } catch (error) {
    const isSlugConflict =
      error instanceof APIError && error.body?.code === "ORGANIZATION_ALREADY_EXISTS";

    if (!isSlugConflict) {
      return { error: toErrorMessage(error) };
    }

    try {
      await auth.api.createOrganization({
        headers: requestHeaders,
        body: { name, slug: `${baseSlug}-${randomSlugSuffix()}` },
      });
    } catch (retryError) {
      return { error: toErrorMessage(retryError) };
    }
  }

  redirect("/dashboard");
}
