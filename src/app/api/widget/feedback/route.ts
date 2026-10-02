import { NextResponse, type NextRequest } from "next/server";

import { insertFeedback } from "@/lib/feedback/queries";
import { getProjectByPublicKey } from "@/lib/projects/queries";
import { widgetFeedbackRateLimiter, widgetRateLimitKey } from "@/lib/rate-limit/widget-limits";
import { screenshotKeyBelongsToProject } from "@/lib/storage/screenshot-upload";
import { buildWidgetCorsHeaders } from "@/lib/widget/cors";
import { isOriginAllowedForProject } from "@/lib/widget/origin";
import { widgetFeedbackSchema } from "@/lib/widget/schemas";

// A generous ceiling for the whole JSON body — the authoritative bound is
// each field's own Zod max length; this just rejects obviously-abusive
// payloads before they're even parsed.
const MAX_BODY_BYTES = 20_000;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = buildWidgetCorsHeaders(origin);

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Payload too large." },
      { status: 413, headers: corsHeaders },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: corsHeaders },
    );
  }

  const parsed = widgetFeedbackSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid feedback." },
      { status: 400, headers: corsHeaders },
    );
  }

  const rateLimitKey = widgetRateLimitKey(parsed.data.projectKey, request);
  const rateLimit = widgetFeedbackRateLimiter.check(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  try {
    // The project is resolved fresh from the key on every submission —
    // the widget never carries a trusted internal projectId, and
    // organizationId/status/authorUserId were never part of
    // widgetFeedbackSchema in the first place, so none of those can
    // arrive from the browser even in a malicious payload.
    const project = await getProjectByPublicKey(parsed.data.projectKey);

    if (!project || project.status !== "active") {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    if (!isOriginAllowedForProject(origin, project.websiteUrl)) {
      return NextResponse.json(
        { error: "This origin is not allowed for this project." },
        { status: 403, headers: corsHeaders },
      );
    }

    // screenshotKey is only ever accepted if it falls under this exact
    // project's (and its organization's) own R2 prefix — a key for a
    // different project, or a handwritten one that merely matches the
    // schema's regex shape, is silently dropped rather than persisted.
    const screenshotKey =
      parsed.data.screenshotKey &&
      screenshotKeyBelongsToProject(parsed.data.screenshotKey, project.organizationId, project.id)
        ? parsed.data.screenshotKey
        : undefined;

    const created = await insertFeedback(project.id, {
      message: parsed.data.message,
      pageUrl: parsed.data.pageUrl,
      selector: parsed.data.selector,
      elementText: parsed.data.elementText,
      screenshotKey,
      viewportWidth: parsed.data.viewportWidth,
      viewportHeight: parsed.data.viewportHeight,
      userAgent: parsed.data.userAgent,
    });

    return NextResponse.json(
      { success: true, feedbackId: created.id },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[widget] failed to create feedback", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500, headers: corsHeaders },
    );
  }
}
