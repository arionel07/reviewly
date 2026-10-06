import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * Exercises the two widget Route Handlers end to end against a real
 * Postgres database. R2 is mocked at its one seam (getObjectStorage) —
 * never real Cloudflare credentials or network access — so this suite
 * runs the same with or without R2_* env vars configured. Skipped (not
 * failed) without DATABASE_URL, matching the existing widget
 * integration test's convention.
 */
vi.mock("@/lib/storage/r2-object-storage", () => ({
  getObjectStorage: () => ({
    createPresignedPutUrl: async ({ key }: { key: string }) =>
      `https://fake-r2.example.com/${key}?signature=test`,
    createPresignedGetUrl: async ({ key }: { key: string }) =>
      `https://fake-r2.example.com/${key}?signature=test&get=1`,
  }),
}));

describe.skipIf(!process.env.DATABASE_URL)("widget Route Handlers (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let clientQueries: typeof import("@/lib/clients/queries");
  let projectQueries: typeof import("@/lib/projects/queries");
  let feedbackRoute: typeof import("./feedback/route");
  let uploadsRoute: typeof import("./uploads/route");
  let screenshotUpload: typeof import("@/lib/storage/screenshot-upload");

  let organizationId: string;
  let activeProjectId: string;
  let activeProjectPublicKey: string;
  const websiteUrl = "https://widget-routes-test.example.com";

  beforeAll(async () => {
    [db, schema, clientQueries, projectQueries, feedbackRoute, uploadsRoute, screenshotUpload] =
      await Promise.all([
        import("@/db").then((m) => m.db),
        import("@/db/schema"),
        import("@/lib/clients/queries"),
        import("@/lib/projects/queries"),
        import("./feedback/route"),
        import("./uploads/route"),
        import("@/lib/storage/screenshot-upload"),
      ]);

    organizationId = randomUUID();

    await db.insert(schema.organization).values({
      id: organizationId,
      name: "Widget Routes Test Workspace",
      slug: `widget-routes-test-${organizationId}`,
      createdAt: new Date(),
    });

    const client = await clientQueries.createClient(organizationId, { name: "Routes Client" });

    activeProjectPublicKey = `pk_${randomUUID()}`;
    const activeProject = await projectQueries.createProject(organizationId, {
      name: "Active Project",
      clientId: client.id,
      websiteUrl,
      status: "active",
      publicKey: activeProjectPublicKey,
    });
    activeProjectId = activeProject.id;
  });

  afterAll(async () => {
    await db.delete(schema.organization).where(inArray(schema.organization.id, [organizationId]));
  });

  function uploadRequest(body: unknown, headers: Record<string, string> = {}) {
    return new NextRequest("https://app.example.com/api/widget/uploads", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  }

  function feedbackRequest(body: unknown, headers: Record<string, string> = {}) {
    return new NextRequest("https://app.example.com/api/widget/feedback", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  }

  describe("POST /api/widget/uploads", () => {
    it("authorizes an upload for an active project from its own origin", async () => {
      const response = await uploadsRoute.POST(
        uploadRequest(
          { projectKey: activeProjectPublicKey, contentType: "image/webp", fileSize: 50_000 },
          { origin: websiteUrl, "x-forwarded-for": "198.51.100.10" },
        ),
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.objectKey).toMatch(
        new RegExp(`^workspaces/${organizationId}/projects/${activeProjectId}/feedback/`),
      );
      expect(body.uploadUrl).toContain(body.objectKey);
    });

    it("rejects an unknown project key", async () => {
      const response = await uploadsRoute.POST(
        uploadRequest(
          { projectKey: `pk_${randomUUID()}`, contentType: "image/webp", fileSize: 1000 },
          { origin: websiteUrl, "x-forwarded-for": "198.51.100.11" },
        ),
      );

      expect(response.status).toBe(404);
    });

    it("rejects a foreign origin", async () => {
      const response = await uploadsRoute.POST(
        uploadRequest(
          { projectKey: activeProjectPublicKey, contentType: "image/webp", fileSize: 1000 },
          { origin: "https://attacker.example", "x-forwarded-for": "198.51.100.12" },
        ),
      );

      expect(response.status).toBe(403);
    });

    it("rejects an oversized declared file size", async () => {
      const response = await uploadsRoute.POST(
        uploadRequest(
          { projectKey: activeProjectPublicKey, contentType: "image/webp", fileSize: 50_000_000 },
          { origin: websiteUrl, "x-forwarded-for": "198.51.100.13" },
        ),
      );

      expect(response.status).toBe(400);
    });

    it("returns 429 once the per-project-per-IP ceiling is exceeded", async () => {
      const ip = "198.51.100.99";

      let lastResponse;
      for (let i = 0; i < 41; i++) {
        lastResponse = await uploadsRoute.POST(
          uploadRequest(
            { projectKey: activeProjectPublicKey, contentType: "image/webp", fileSize: 1000 },
            { origin: websiteUrl, "x-forwarded-for": ip },
          ),
        );
      }

      expect(lastResponse!.status).toBe(429);
    });
  });

  describe("POST /api/widget/feedback", () => {
    it("creates feedback with a screenshotKey that belongs to the resolved project", async () => {
      const screenshotKey = screenshotUpload.generateScreenshotObjectKey(
        organizationId,
        activeProjectId,
        "image/webp",
      );

      const response = await feedbackRoute.POST(
        feedbackRequest(
          {
            projectKey: activeProjectPublicKey,
            message: "The hero image is blurry.",
            pageUrl: `${websiteUrl}/`,
            elementText: "Welcome to Acme",
            screenshotKey,
          },
          { origin: websiteUrl, "x-forwarded-for": "198.51.100.20" },
        ),
      );

      expect(response.status).toBe(201);
      const body = await response.json();

      const [created] = await db
        .select()
        .from(schema.feedback)
        .where(eq(schema.feedback.id, body.feedbackId));

      expect(created.status).toBe("open");
      expect(created.screenshotKey).toBe(screenshotKey);
      expect(created.elementText).toBe("Welcome to Acme");

      const [notification] = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.feedbackId, body.feedbackId));

      expect(notification.type).toBe("feedback_created");
      expect(notification.organizationId).toBe(organizationId);
      expect(notification.projectId).toBe(activeProjectId);
      expect(notification.title).toBe("New feedback");
    });

    it("silently drops a screenshotKey that belongs to a different project", async () => {
      const foreignKey = screenshotUpload.generateScreenshotObjectKey(
        organizationId,
        randomUUID(),
        "image/webp",
      );

      const response = await feedbackRoute.POST(
        feedbackRequest(
          {
            projectKey: activeProjectPublicKey,
            message: "Attempting to attach someone else's screenshot.",
            pageUrl: `${websiteUrl}/`,
            screenshotKey: foreignKey,
          },
          { origin: websiteUrl, "x-forwarded-for": "198.51.100.21" },
        ),
      );

      expect(response.status).toBe(201);
      const body = await response.json();

      const [created] = await db
        .select()
        .from(schema.feedback)
        .where(eq(schema.feedback.id, body.feedbackId));

      expect(created.screenshotKey).toBeNull();
    });

    it("returns 429 once the per-project-per-IP ceiling is exceeded", async () => {
      const ip = "198.51.100.98";

      let lastResponse;
      for (let i = 0; i < 21; i++) {
        lastResponse = await feedbackRoute.POST(
          feedbackRequest(
            {
              projectKey: activeProjectPublicKey,
              message: "Rate limit probe.",
              pageUrl: `${websiteUrl}/`,
            },
            { origin: websiteUrl, "x-forwarded-for": ip },
          ),
        );
      }

      expect(lastResponse!.status).toBe(429);
    });
  });
});
