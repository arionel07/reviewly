import type { FeedbackPayloadInput } from "@/widget/lib/payload";

export type ProjectConfig = {
  name: string;
  websiteUrl: string;
};

export class WidgetApiError extends Error {}

export async function fetchProjectConfig(
  apiBaseUrl: string,
  projectKey: string,
): Promise<ProjectConfig> {
  const response = await fetch(
    `${apiBaseUrl}/api/widget/projects/${encodeURIComponent(projectKey)}`,
    { method: "GET" },
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new WidgetApiError(body?.error ?? "Could not load the Reviewly widget.");
  }

  return body.project as ProjectConfig;
}

export type UploadAuthorization = {
  uploadUrl: string;
  objectKey: string;
  contentType: string;
};

export async function requestUploadAuthorization(
  apiBaseUrl: string,
  input: { projectKey: string; contentType: string; fileSize: number },
): Promise<UploadAuthorization> {
  const response = await fetch(`${apiBaseUrl}/api/widget/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new WidgetApiError(body?.error ?? "Could not prepare the screenshot upload.");
  }

  return body as UploadAuthorization;
}

/**
 * Uploads directly to R2 via the presigned URL — large binary traffic
 * never passes through the Next.js app (see docs/ARCHITECTURE.md). Not
 * using the shared `WidgetApiError`-wrapping convention here on purpose:
 * callers treat any failure of this step as "no screenshot", not as a
 * reason to fail the whole submission (see ReviewlyWidget.submitFeedback).
 */
export async function uploadScreenshot(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Screenshot upload failed with status ${response.status}.`);
  }
}

export async function submitFeedback(
  apiBaseUrl: string,
  payload: FeedbackPayloadInput,
): Promise<{ feedbackId: string }> {
  const response = await fetch(`${apiBaseUrl}/api/widget/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new WidgetApiError(body?.error ?? "Could not send feedback. Please try again.");
  }

  return { feedbackId: body.feedbackId as string };
}
