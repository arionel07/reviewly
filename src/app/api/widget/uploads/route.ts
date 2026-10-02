import { NextResponse, type NextRequest } from "next/server";

import { getProjectByPublicKey } from "@/lib/projects/queries";
import { widgetRateLimitKey, widgetUploadRateLimiter } from "@/lib/rate-limit/widget-limits";
import { getObjectStorage } from "@/lib/storage/r2-object-storage";
import { generateScreenshotObjectKey } from "@/lib/storage/screenshot-upload";
import { buildWidgetCorsHeaders } from "@/lib/widget/cors";
import { isOriginAllowedForProject } from "@/lib/widget/origin";
import { widgetUploadAuthorizationSchema } from "@/lib/widget/schemas";

const MAX_BODY_BYTES = 2_000;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(request.headers.get("origin")),
  });
}

/**
 * Upload authorization only — this never receives or forwards screenshot
 * bytes. It validates the caller (public key, project status, origin),
 * generates a server-controlled object key under the resolved project's
 * own prefix, and hands back a short-lived presigned R2 PUT URL so the
 * widget can upload directly to R2 (see docs/ARCHITECTURE.md and the
 * Widget Phase 2 report's "Upload architecture" section for why bytes
 * never pass through this Route Handler).
 */
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

  const parsed = widgetUploadAuthorizationSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload request." },
      { status: 400, headers: corsHeaders },
    );
  }

  const { projectKey, contentType, fileSize } = parsed.data;

  const rateLimitKey = widgetRateLimitKey(projectKey, request);
  const rateLimit = widgetUploadRateLimiter.check(rateLimitKey);

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
    const project = await getProjectByPublicKey(projectKey);

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

    const objectKey = generateScreenshotObjectKey(
      project.organizationId,
      project.id,
      contentType,
    );

    const uploadUrl = await getObjectStorage().createPresignedPutUrl({
      key: objectKey,
      contentType,
      contentLength: fileSize,
    });

    return NextResponse.json(
      { uploadUrl, objectKey, contentType },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[widget] failed to authorize upload", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500, headers: corsHeaders },
    );
  }
}
