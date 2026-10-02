import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Exercises the widget's two real database entry points against a real
 * Postgres database: resolving a project by its public key (no
 * organizationId available, since the widget has no session), and the
 * shared insertFeedback primitive both the widget route and manual
 * creation funnel into. Skipped (not failed) when no DATABASE_URL is
 * configured; everything is dynamically imported inside beforeAll so
 * that import never happens when the suite is skipped.
 */
describe.skipIf(!process.env.DATABASE_URL)("widget domain (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let clientQueries: typeof import("@/lib/clients/queries");
  let projectQueries: typeof import("@/lib/projects/queries");
  let feedbackQueries: typeof import("@/lib/feedback/queries");

  let organizationId: string;
  let activeProjectId: string;
  let activeProjectPublicKey: string;
  let draftProjectPublicKey: string;

  beforeAll(async () => {
    [{ db }, schema, clientQueries, projectQueries, feedbackQueries] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("@/lib/clients/queries"),
      import("@/lib/projects/queries"),
      import("@/lib/feedback/queries"),
    ]);

    organizationId = randomUUID();

    await db.insert(schema.organization).values({
      id: organizationId,
      name: "Widget Test Workspace",
      slug: `widget-test-${organizationId}`,
      createdAt: new Date(),
    });

    const client = await clientQueries.createClient(organizationId, { name: "Widget Client" });

    activeProjectPublicKey = `pk_${randomUUID()}`;
    const activeProject = await projectQueries.createProject(organizationId, {
      name: "Active Project",
      clientId: client.id,
      websiteUrl: "https://widget-test.example.com",
      status: "active",
      publicKey: activeProjectPublicKey,
    });
    activeProjectId = activeProject.id;

    draftProjectPublicKey = `pk_${randomUUID()}`;
    await projectQueries.createProject(organizationId, {
      name: "Draft Project",
      clientId: client.id,
      websiteUrl: "https://widget-test.example.com",
      status: "draft",
      publicKey: draftProjectPublicKey,
    });
  });

  afterAll(async () => {
    await db.delete(schema.organization).where(inArray(schema.organization.id, [organizationId]));
  });

  describe("getProjectByPublicKey", () => {
    it("resolves an active project by its public key", async () => {
      const project = await projectQueries.getProjectByPublicKey(activeProjectPublicKey);

      expect(project?.id).toBe(activeProjectId);
      expect(project?.status).toBe("active");
      expect(project?.websiteUrl).toBe("https://widget-test.example.com");
    });

    it("returns null for an unknown key", async () => {
      const project = await projectQueries.getProjectByPublicKey(`pk_${randomUUID()}`);

      expect(project).toBeNull();
    });

    it("still returns a non-active project — gating on status is the route's job", async () => {
      const project = await projectQueries.getProjectByPublicKey(draftProjectPublicKey);

      expect(project?.status).toBe("draft");
    });
  });

  describe("insertFeedback", () => {
    it("creates feedback that defaults to status 'open'", async () => {
      const created = await feedbackQueries.insertFeedback(activeProjectId, {
        message: "The checkout button is unreadable on mobile.",
        pageUrl: "https://widget-test.example.com/checkout",
      });

      expect(created.status).toBe("open");
      expect(created.projectId).toBe(activeProjectId);

      const stored = await feedbackQueries.getFeedback(
        created.id,
        activeProjectId,
        organizationId,
      );
      expect(stored?.status).toBe("open");
    });

    it("stores widget-captured context fields when provided", async () => {
      const created = await feedbackQueries.insertFeedback(activeProjectId, {
        message: "Nav overlaps the logo at this width.",
        pageUrl: "https://widget-test.example.com/",
        selector: "header.site-header",
        viewportWidth: 390,
        viewportHeight: 844,
        userAgent: "Mozilla/5.0 (test)",
      });

      expect(created.selector).toBe("header.site-header");
      expect(created.viewportWidth).toBe(390);
      expect(created.viewportHeight).toBe(844);
      expect(created.userAgent).toBe("Mozilla/5.0 (test)");
    });

    it("ignores any status passed in the write data — the column default always wins", async () => {
      const created = await feedbackQueries.insertFeedback(activeProjectId, {
        // @ts-expect-error -- deliberately simulating a malicious/forged call
        status: "resolved",
        message: "Attempting to forge a resolved status.",
        pageUrl: "https://widget-test.example.com/",
      });

      expect(created.status).toBe("open");
    });
  });
});
