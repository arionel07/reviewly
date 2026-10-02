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
