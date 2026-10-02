import { NextResponse, type NextRequest } from "next/server";

import { getProjectByPublicKey } from "@/lib/projects/queries";
import { buildWidgetCorsHeaders } from "@/lib/widget/cors";
import { isOriginAllowedForProject } from "@/lib/widget/origin";
import { toPublicProjectDto } from "@/lib/widget/project-dto";
import { publicKeySchema } from "@/lib/widget/schemas";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(request.headers.get("origin")),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicKey: string }> },
) {
  const origin = request.headers.get("origin");
  const corsHeaders = buildWidgetCorsHeaders(origin);
  const { publicKey } = await params;

  const parsedKey = publicKeySchema.safeParse(publicKey);

  if (!parsedKey.success) {
    return NextResponse.json(
      { error: "Invalid project key." },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const project = await getProjectByPublicKey(parsedKey.data);

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

    return NextResponse.json(
      { project: toPublicProjectDto(project) },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[widget] failed to load project config", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500, headers: corsHeaders },
    );
  }
}
