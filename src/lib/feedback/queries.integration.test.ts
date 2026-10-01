import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Exercises tenant scoping against a real Postgres database. Feedback
 * has no organizationId column of its own — every check here goes
 * through the project it belongs to, which is exactly the path the task
 * calls out as security-critical. Skipped (not failed) when no
 * DATABASE_URL is configured, since importing "@/db" throws at module
 * load otherwise; everything below is dynamically imported inside
 * beforeAll so that import never happens when the suite is skipped.
 */
describe.skipIf(!process.env.DATABASE_URL)(
  "feedback tenant scoping (integration)",
  () => {
    let db: typeof import("@/db").db;
    let schema: typeof import("@/db/schema");
    let clientQueries: typeof import("@/lib/clients/queries");
    let projectQueries: typeof import("@/lib/projects/queries");
    let queries: typeof import("./queries");

    let organizationAId: string;
    let organizationBId: string;
    let projectAId: string;
    let projectBId: string;

    beforeAll(async () => {
      [{ db }, schema, clientQueries, projectQueries, queries] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("@/lib/clients/queries"),
        import("@/lib/projects/queries"),
        import("./queries"),
      ]);

      organizationAId = randomUUID();
      organizationBId = randomUUID();

      await db.insert(schema.organization).values([
        {
          id: organizationAId,
          name: "Workspace A",
          slug: `workspace-a-${organizationAId}`,
          createdAt: new Date(),
        },
        {
          id: organizationBId,
          name: "Workspace B",
          slug: `workspace-b-${organizationBId}`,
          createdAt: new Date(),
        },
      ]);

      const clientA = await clientQueries.createClient(organizationAId, { name: "Client A" });
      const clientB = await clientQueries.createClient(organizationBId, { name: "Client B" });

      const projectA = await projectQueries.createProject(organizationAId, {
        name: "Project A",
        clientId: clientA.id,
        websiteUrl: "https://a.example.com",
        status: "active",
        publicKey: `pk_${randomUUID()}`,
      });
      const projectB = await projectQueries.createProject(organizationBId, {
        name: "Project B",
        clientId: clientB.id,
        websiteUrl: "https://b.example.com",
        status: "active",
        publicKey: `pk_${randomUUID()}`,
      });
      projectAId = projectA.id;
      projectBId = projectB.id;
    });

    afterAll(async () => {
      // Cascades to clients/projects/feedback/comments left over from a
      // failed assertion.
      await db
        .delete(schema.organization)
        .where(inArray(schema.organization.id, [organizationAId, organizationBId]));
    });

    function feedbackInput(overrides: Partial<{ message: string; pageUrl: string }> = {}) {
      return {
        message: "The checkout button is unreadable on mobile.",
        pageUrl: "https://a.example.com/checkout",
        ...overrides,
      };
    }

    it("lets a workspace create, read, update, and delete its own feedback", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());
      expect(created).not.toBeNull();

      const read = await queries.getFeedback(created!.id, projectAId, organizationAId);
      expect(read?.id).toBe(created!.id);
      expect(read?.status).toBe("open");

      const updated = await queries.updateFeedback(created!.id, projectAId, organizationAId, {
        ...feedbackInput({ message: "Updated message" }),
      });
      expect(updated?.message).toBe("Updated message");

      const deleted = await queries.deleteFeedback(created!.id, projectAId, organizationAId);
      expect(deleted?.id).toBe(created!.id);

      expect(await queries.getFeedback(created!.id, projectAId, organizationAId)).toBeNull();
    });

    it("rejects creating feedback under a foreign-workspace project", async () => {
      const created = await queries.createFeedback(projectBId, organizationAId, feedbackInput());

      expect(created).toBeNull();
    });

    it("changes status only through updateFeedbackStatus, scoped the same way", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());

      const updated = await queries.updateFeedbackStatus(
        created!.id,
        projectAId,
        organizationAId,
        "in_progress",
      );
      expect(updated?.status).toBe("in_progress");

      const crossTenantChange = await queries.updateFeedbackStatus(
        created!.id,
        projectAId,
        organizationBId,
        "resolved",
      );
      expect(crossTenantChange).toBeNull();

      const unchanged = await queries.getFeedback(created!.id, projectAId, organizationAId);
      expect(unchanged?.status).toBe("in_progress");
    });

    it("hides another workspace's feedback from a cross-tenant read", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());

      const crossTenantRead = await queries.getFeedback(
        created!.id,
        projectAId,
        organizationBId,
      );
      expect(crossTenantRead).toBeNull();

      const ownerRead = await queries.getFeedback(created!.id, projectAId, organizationAId);
      expect(ownerRead?.id).toBe(created!.id);
    });

    it("never updates another workspace's feedback", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());

      const crossTenantUpdate = await queries.updateFeedback(
        created!.id,
        projectAId,
        organizationBId,
        feedbackInput({ message: "Hijacked" }),
      );
      expect(crossTenantUpdate).toBeNull();

      const unchanged = await queries.getFeedback(created!.id, projectAId, organizationAId);
      expect(unchanged?.message).toBe(feedbackInput().message);
    });

    it("never deletes another workspace's feedback", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());

      const crossTenantDelete = await queries.deleteFeedback(
        created!.id,
        projectAId,
        organizationBId,
      );
      expect(crossTenantDelete).toBeNull();

      const stillExists = await queries.getFeedback(created!.id, projectAId, organizationAId);
      expect(stillExists?.id).toBe(created!.id);
    });

    it("never adds a comment to another workspace's feedback", async () => {
      const created = await queries.createFeedback(projectAId, organizationAId, feedbackInput());

      const [userRow] = await db
        .insert(schema.user)
        .values({
          id: randomUUID(),
          name: "Someone",
          email: `someone-${randomUUID()}@example.com`,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const crossTenantComment = await queries.createFeedbackComment(
        created!.id,
        projectAId,
        organizationBId,
        userRow.id,
        "I shouldn't be able to post this.",
      );
      expect(crossTenantComment).toBeNull();

      const comments = await queries.listFeedbackComments(
        created!.id,
        projectAId,
        organizationAId,
      );
      expect(comments).toHaveLength(0);

      const ownComment = await queries.createFeedbackComment(
        created!.id,
        projectAId,
        organizationAId,
        userRow.id,
        "This one should work.",
      );
      expect(ownComment).not.toBeNull();

      const commentsAfter = await queries.listFeedbackComments(
        created!.id,
        projectAId,
        organizationAId,
      );
      expect(commentsAfter).toHaveLength(1);
      expect(commentsAfter[0].authorUserName).toBe("Someone");
    });

    it("scopes listFeedbackForProject to the given project/organization and supports status filtering", async () => {
      await queries.createFeedback(projectAId, organizationAId, feedbackInput());
      const resolvedOne = await queries.createFeedback(
        projectAId,
        organizationAId,
        feedbackInput({ message: "Resolved one" }),
      );
      await queries.updateFeedbackStatus(resolvedOne!.id, projectAId, organizationAId, "resolved");

      const all = await queries.listFeedbackForProject(projectAId, organizationAId);
      expect(all.length).toBeGreaterThanOrEqual(2);

      const resolvedOnly = await queries.listFeedbackForProject(
        projectAId,
        organizationAId,
        "resolved",
      );
      expect(resolvedOnly.every((item) => item.status === "resolved")).toBe(true);

      const crossTenantList = await queries.listFeedbackForProject(projectAId, organizationBId);
      expect(crossTenantList).toEqual([]);
    });

    it("treats malformed UUIDs as not found rather than a database error", async () => {
      await expect(
        queries.getFeedback("not-a-uuid", projectAId, organizationAId),
      ).resolves.toBeNull();
      await expect(
        queries.getFeedback(randomUUID(), "not-a-uuid", organizationAId),
      ).resolves.toBeNull();
      await expect(
        queries.updateFeedback("not-a-uuid", projectAId, organizationAId, feedbackInput()),
      ).resolves.toBeNull();
      await expect(
        queries.deleteFeedback("not-a-uuid", projectAId, organizationAId),
      ).resolves.toBeNull();
      await expect(
        queries.listFeedbackForProject("not-a-uuid", organizationAId),
      ).resolves.toEqual([]);
    });
  },
);
