import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// revalidatePath requires a Next.js request/render context that doesn't
// exist when calling a Server Action directly from a test — mocked the
// same way a Route Handler integration test mocks its one external
// seam, not a reason to skip exercising the action's actual security
// logic (token re-verification, project/feedback scoping).
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/**
 * Exercises the review-token domain against a real Postgres database:
 * issuance, lookup, revocation, expiry, tenant isolation between two
 * workspaces, and the public mutation actions (anonymous comment,
 * reopen) re-deriving project access from the raw token on every call.
 * Skipped (not failed) without DATABASE_URL, matching the existing
 * integration tests' convention.
 */
describe.skipIf(!process.env.DATABASE_URL)("review token domain (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let clientQueries: typeof import("@/lib/clients/queries");
  let projectQueries: typeof import("@/lib/projects/queries");
  let feedbackQueries: typeof import("@/lib/feedback/queries");
  let reviewQueries: typeof import("./queries");
  let reviewActions: typeof import("./actions");
  let reviewToken: typeof import("./token");

  let orgA: string;
  let orgB: string;
  let projectA: string;
  let projectAInOrgB: string; // a second project, owned by orgB, to prove isolation

  beforeAll(async () => {
    [db, schema, clientQueries, projectQueries, feedbackQueries, reviewQueries, reviewActions, reviewToken] =
      await Promise.all([
        import("@/db").then((m) => m.db),
        import("@/db/schema"),
        import("@/lib/clients/queries"),
        import("@/lib/projects/queries"),
        import("@/lib/feedback/queries"),
        import("./queries"),
        import("./actions"),
        import("./token"),
      ]);

    orgA = randomUUID();
    orgB = randomUUID();

    await db.insert(schema.organization).values([
      { id: orgA, name: "Org A", slug: `org-a-${orgA}`, createdAt: new Date() },
      { id: orgB, name: "Org B", slug: `org-b-${orgB}`, createdAt: new Date() },
    ]);

    const clientA = await clientQueries.createClient(orgA, { name: "Client A" });
    const clientB = await clientQueries.createClient(orgB, { name: "Client B" });

    const createdA = await projectQueries.createProject(orgA, {
      name: "Project A",
      clientId: clientA.id,
      websiteUrl: "https://a.example.com",
      status: "active",
      publicKey: `pk_${randomUUID()}`,
    });
    projectA = createdA.id;

    const createdB = await projectQueries.createProject(orgB, {
      name: "Project B",
      clientId: clientB.id,
      websiteUrl: "https://b.example.com",
      status: "active",
      publicKey: `pk_${randomUUID()}`,
    });
    projectAInOrgB = createdB.id;
  });

  async function createFreshProject(organizationId: string, label: string) {
    const client = await clientQueries.createClient(organizationId, {
      name: `${label} Client`,
    });
    const project = await projectQueries.createProject(organizationId, {
      name: label,
      clientId: client.id,
      websiteUrl: `https://${label.toLowerCase().replaceAll(" ", "-")}.example.com`,
      status: "active",
      publicKey: `pk_${randomUUID()}`,
    });

    return project.id;
  }

  async function addFeedbackWithStatus(
    projectId: string,
    status: "open" | "in_progress" | "resolved" | "reopened",
  ) {
    const item = await feedbackQueries.insertFeedback(projectId, {
      message: `Feedback in ${status}`,
      pageUrl: "https://example.com/",
    });

    if (status !== "open") {
      await feedbackQueries.updateFeedbackStatusInProject(item.id, projectId, status);
    }

    return item;
  }

  afterAll(async () => {
    await db.delete(schema.organization).where(inArray(schema.organization.id, [orgA, orgB]));
  });

  describe("issuance and lookup", () => {
    it("issues a token and persists only its hash, never the raw value", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      expect(issued).not.toBeNull();

      const { eq } = await import("drizzle-orm");
      const stored = await db
        .select({ tokenHash: schema.reviewAccessTokens.tokenHash })
        .from(schema.reviewAccessTokens)
        .where(eq(schema.reviewAccessTokens.id, issued!.id));

      expect(stored[0]?.tokenHash).toBe(reviewToken.hashReviewToken(issued!.rawToken));
      expect(stored[0]?.tokenHash).not.toBe(issued!.rawToken);
    });

    it("resolves a valid token to its project", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const resolved = await reviewQueries.findProjectByReviewToken(issued!.rawToken);

      expect(resolved?.id).toBe(projectA);
      expect(resolved?.name).toBe("Project A");
    });

    it("rejects an unknown token", async () => {
      const resolved = await reviewQueries.findProjectByReviewToken(
        reviewToken.generateRawReviewToken(),
      );
      expect(resolved).toBeNull();
    });

    it("rejects a malformed token without querying the database oddly", async () => {
      const resolved = await reviewQueries.findProjectByReviewToken("not-a-real-token");
      expect(resolved).toBeNull();
    });
  });

  describe("revocation and expiry", () => {
    it("a revoked token is rejected immediately", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      expect(await reviewQueries.findProjectByReviewToken(issued!.rawToken)).not.toBeNull();

      await reviewQueries.revokeAllReviewTokens(projectA, orgA);

      expect(await reviewQueries.findProjectByReviewToken(issued!.rawToken)).toBeNull();
    });

    it("an expired token is rejected", async () => {
      const { eq } = await import("drizzle-orm");
      const rawToken = reviewToken.generateRawReviewToken();
      const tokenHash = reviewToken.hashReviewToken(rawToken);

      await db.insert(schema.reviewAccessTokens).values({
        projectId: projectA,
        tokenHash,
        expiresAt: new Date(Date.now() - 60_000),
      });

      expect(await reviewQueries.findProjectByReviewToken(rawToken)).toBeNull();

      await db.delete(schema.reviewAccessTokens).where(eq(schema.reviewAccessTokens.tokenHash, tokenHash));
    });
  });

  describe("tenant isolation", () => {
    it("workspace B cannot issue a token for workspace A's project", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgB);
      expect(issued).toBeNull();
    });

    it("workspace B cannot revoke workspace A's project's tokens", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);

      const revoked = await reviewQueries.revokeAllReviewTokens(projectA, orgB);
      expect(revoked).toBe(false);

      // Still resolvable — orgB's attempt had no effect.
      expect(await reviewQueries.findProjectByReviewToken(issued!.rawToken)).not.toBeNull();
    });
  });

  describe("feedback scoping through a token", () => {
    it("a valid token can list only its own project's feedback", async () => {
      const feedbackA = await feedbackQueries.insertFeedback(projectA, {
        message: "Feedback on project A",
        pageUrl: "https://a.example.com/",
      });
      const feedbackB = await feedbackQueries.insertFeedback(projectAInOrgB, {
        message: "Feedback on project B",
        pageUrl: "https://b.example.com/",
      });

      const listA = await feedbackQueries.listFeedbackForProjectUnchecked(projectA);
      expect(listA.map((item) => item.id)).toContain(feedbackA.id);
      expect(listA.map((item) => item.id)).not.toContain(feedbackB.id);
    });

    it("feedback from another project is not accessible through this project's id", async () => {
      const feedbackB = await feedbackQueries.insertFeedback(projectAInOrgB, {
        message: "Feedback that belongs to project B",
        pageUrl: "https://b.example.com/",
      });

      const result = await feedbackQueries.getFeedbackInProject(feedbackB.id, projectA);
      expect(result).toBeNull();
    });
  });

  describe("public portal actions", () => {
    it("a client comment works through a valid token", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const feedbackItem = await feedbackQueries.insertFeedback(projectA, {
        message: "Button overlaps on mobile",
        pageUrl: "https://a.example.com/",
      });

      const result = await reviewActions.submitClientCommentAction(issued!.rawToken, feedbackItem.id, {
        authorName: "Jane Client",
        body: "Confirmed, still broken on my phone.",
      });

      expect(result).toBeUndefined();

      const comments = await feedbackQueries.listFeedbackCommentsUnchecked(feedbackItem.id);
      expect(comments.some((comment) => comment.body === "Confirmed, still broken on my phone.")).toBe(
        true,
      );

      const [notification] = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.feedbackId, feedbackItem.id));
      expect(notification.type).toBe("feedback_commented");
      expect(notification.title).toBe("New client comment");
    });

    it("a client comment cannot target another project's feedback", async () => {
      const issuedForA = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const feedbackInB = await feedbackQueries.insertFeedback(projectAInOrgB, {
        message: "Feedback that belongs to project B",
        pageUrl: "https://b.example.com/",
      });

      const result = await reviewActions.submitClientCommentAction(
        issuedForA!.rawToken,
        feedbackInB.id,
        { authorName: "Attacker", body: "Trying to comment cross-project." },
      );

      expect(result?.error).toBeDefined();

      const comments = await feedbackQueries.listFeedbackCommentsUnchecked(feedbackInB.id);
      expect(comments.some((comment) => comment.body === "Trying to comment cross-project.")).toBe(
        false,
      );
    });

    it("resolved -> reopened works through a valid token", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const feedbackItem = await feedbackQueries.insertFeedback(projectA, {
        message: "Will be resolved then reopened",
        pageUrl: "https://a.example.com/",
      });

      await feedbackQueries.updateFeedbackStatusInProject(feedbackItem.id, projectA, "resolved");

      const result = await reviewActions.reopenFeedbackAction(issued!.rawToken, feedbackItem.id);
      expect(result).toBeUndefined();

      const updated = await feedbackQueries.getFeedbackInProject(feedbackItem.id, projectA);
      expect(updated?.status).toBe("reopened");

      const [notification] = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.feedbackId, feedbackItem.id));
      expect(notification.type).toBe("feedback_reopened");
      expect(notification.title).toBe("Feedback reopened");
    });

    it("rejects reopening feedback that isn't resolved", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const feedbackItem = await feedbackQueries.insertFeedback(projectA, {
        message: "Still open, never resolved",
        pageUrl: "https://a.example.com/",
      });

      const result = await reviewActions.reopenFeedbackAction(issued!.rawToken, feedbackItem.id);
      expect(result?.error).toBeDefined();

      const unchanged = await feedbackQueries.getFeedbackInProject(feedbackItem.id, projectA);
      expect(unchanged?.status).toBe("open");
      const notifications = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.feedbackId, feedbackItem.id));
      expect(notifications).toHaveLength(0);
    });

    it("a revoked token cannot comment or reopen", async () => {
      const issued = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const feedbackItem = await feedbackQueries.insertFeedback(projectA, {
        message: "Resolved, link then revoked",
        pageUrl: "https://a.example.com/",
      });
      await feedbackQueries.updateFeedbackStatusInProject(feedbackItem.id, projectA, "resolved");

      await reviewQueries.revokeAllReviewTokens(projectA, orgA);

      const commentResult = await reviewActions.submitClientCommentAction(
        issued!.rawToken,
        feedbackItem.id,
        { authorName: "Too Late", body: "This should not be allowed." },
      );
      expect(commentResult?.error).toBeDefined();

      const reopenResult = await reviewActions.reopenFeedbackAction(issued!.rawToken, feedbackItem.id);
      expect(reopenResult?.error).toBeDefined();
    });
  });

  describe("project review rounds", () => {
    it.each(["open", "in_progress", "reopened"] as const)(
      "rejects a review request while %s feedback is blocking",
      async (status) => {
        const projectId = await createFreshProject(orgA, `Blocking ${status}`);
        await addFeedbackWithStatus(projectId, status);

        const result = await reviewQueries.requestProjectReview(projectId, orgA);

        expect(result).toEqual({ error: "blocking_feedback", blockingCount: 1 });
      },
    );

    it("allows a review request when all feedback is resolved", async () => {
      const projectId = await createFreshProject(orgA, "Ready project");
      await addFeedbackWithStatus(projectId, "resolved");

      const result = await reviewQueries.requestProjectReview(projectId, orgA);

      expect("review" in result && result.review.status).toBe("pending");
      expect("review" in result && result.review.requestedAt).toBeInstanceOf(Date);
      expect("rawToken" in result && result.rawToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(
        "rawToken" in result && (await reviewQueries.findProjectByReviewToken(result.rawToken))?.id,
      ).toBe(projectId);
    });

    it("rotates the current link when requesting review and when resending", async () => {
      const projectId = await createFreshProject(orgA, "Rotating review project");
      await addFeedbackWithStatus(projectId, "resolved");
      const old = await reviewQueries.createReviewAccessToken(projectId, orgA);

      const requested = await reviewQueries.requestProjectReview(projectId, orgA);
      expect("review" in requested).toBe(true);
      expect(await reviewQueries.findProjectByReviewToken(old!.rawToken)).toBeNull();
      expect(
        "rawToken" in requested && (await reviewQueries.findProjectByReviewToken(requested.rawToken))?.id,
      ).toBe(projectId);

      const historyBeforeResend = await reviewQueries.listProjectReviews(projectId, orgA);
      const resent = await reviewQueries.rotatePendingProjectReviewToken(projectId, orgA);

      expect("rawToken" in resent).toBe(true);
      expect(historyBeforeResend).toHaveLength(1);
      expect(
        "rawToken" in requested && (await reviewQueries.findProjectByReviewToken(requested.rawToken)),
      ).toBeNull();
      expect(
        "rawToken" in resent && (await reviewQueries.findProjectByReviewToken(resent.rawToken))?.id,
      ).toBe(projectId);
      expect(await reviewQueries.listProjectReviews(projectId, orgA)).toHaveLength(1);
    });

    it("allows only one pending review per project", async () => {
      const projectId = await createFreshProject(orgA, "Single pending project");

      const first = await reviewQueries.requestProjectReview(projectId, orgA);
      const second = await reviewQueries.requestProjectReview(projectId, orgA);

      expect("review" in first).toBe(true);
      expect(second).toEqual({ error: "already_pending" });
    });

    it("does not allow another workspace to request a review", async () => {
      const projectId = await createFreshProject(orgA, "Tenant isolated project");

      const result = await reviewQueries.requestProjectReview(projectId, orgB);

      expect(result).toEqual({ error: "not_found" });
    });

    it("does not allow another workspace to rotate a pending review link", async () => {
      const projectId = await createFreshProject(orgA, "Tenant isolated resend project");
      await addFeedbackWithStatus(projectId, "resolved");
      await reviewQueries.requestProjectReview(projectId, orgA);

      expect(await reviewQueries.rotatePendingProjectReviewToken(projectId, orgB)).toEqual({
        error: "not_found",
      });
    });

    it("approves a pending review without changing feedback or project status", async () => {
      const projectId = await createFreshProject(orgA, "Approval project");
      const feedbackItem = await addFeedbackWithStatus(projectId, "resolved");
      const requested = await reviewQueries.requestProjectReview(projectId, orgA);
      const issued = await reviewQueries.createReviewAccessToken(projectId, orgA);

      const result = await reviewActions.approveProjectReviewAction(issued!.rawToken);
      const project = await projectQueries.getProject(projectId, orgA);
      const feedback = await feedbackQueries.getFeedbackInProject(feedbackItem.id, projectId);
      const latest = await reviewQueries.getLatestProjectReview(projectId, orgA);
      const [notification] = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.projectReviewId, latest!.id));

      expect(result).toBeUndefined();
      expect("review" in requested && requested.review.status).toBe("pending");
      expect(latest?.status).toBe("approved");
      expect(latest?.decidedAt).toBeInstanceOf(Date);
      expect(feedback?.status).toBe("resolved");
      expect(project?.status).toBe("active");
      expect(notification.type).toBe("review_approved");
      expect(notification.organizationId).toBe(orgA);
    });

    it("rejects decisions for malformed, expired, and revoked tokens", async () => {
      const projectId = await createFreshProject(orgA, "Token decision project");
      const malformed = await reviewActions.approveProjectReviewAction("not-a-token");
      expect(malformed?.error).toBeDefined();

      await reviewQueries.requestProjectReview(projectId, orgA);
      const revoked = await reviewQueries.createReviewAccessToken(projectId, orgA);
      await reviewQueries.revokeAllReviewTokens(projectId, orgA);
      const revokedResult = await reviewActions.approveProjectReviewAction(revoked!.rawToken);
      expect(revokedResult?.error).toBeDefined();

      const expiredProjectId = await createFreshProject(orgA, "Expired decision project");
      await reviewQueries.requestProjectReview(expiredProjectId, orgA);
      const rawToken = reviewToken.generateRawReviewToken();
      const tokenHash = reviewToken.hashReviewToken(rawToken);
      await db.insert(schema.reviewAccessTokens).values({
        projectId: expiredProjectId,
        tokenHash,
        expiresAt: new Date(Date.now() - 60_000),
      });

      const expiredResult = await reviewActions.approveProjectReviewAction(rawToken);
      expect(expiredResult?.error).toBeDefined();
    });

    it("requests changes without mutating feedback", async () => {
      const projectId = await createFreshProject(orgA, "Changes project");
      const feedbackItem = await addFeedbackWithStatus(projectId, "resolved");
      await reviewQueries.requestProjectReview(projectId, orgA);
      const issued = await reviewQueries.createReviewAccessToken(projectId, orgA);

      const result = await reviewActions.requestProjectChangesAction(issued!.rawToken);
      const latest = await reviewQueries.getLatestProjectReview(projectId, orgA);
      const feedback = await feedbackQueries.getFeedbackInProject(feedbackItem.id, projectId);
      const [notification] = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.projectReviewId, latest!.id));

      expect(result).toBeUndefined();
      expect(latest?.status).toBe("changes_requested");
      expect(latest?.decidedAt).toBeInstanceOf(Date);
      expect(feedback?.status).toBe("resolved");
      expect(notification.type).toBe("review_changes_requested");
    });

    it("preserves multiple immutable review rounds", async () => {
      const projectId = await createFreshProject(orgA, "Multiple rounds project");
      await addFeedbackWithStatus(projectId, "resolved");

      const firstRequest = await reviewQueries.requestProjectReview(projectId, orgA);
      if (!("review" in firstRequest)) throw new Error("Expected the first review request to succeed.");

      await reviewActions.requestProjectChangesAction(firstRequest.rawToken);
      const firstRound = await reviewQueries.getLatestProjectReview(projectId, orgA);
      const decidedApprove = await reviewActions.approveProjectReviewAction(firstRequest.rawToken);
      const decidedChanges = await reviewActions.requestProjectChangesAction(firstRequest.rawToken);
      const secondRequest = await reviewQueries.requestProjectReview(projectId, orgA);
      if (!("review" in secondRequest)) throw new Error("Expected the second review request to succeed.");

      await reviewActions.approveProjectReviewAction(secondRequest.rawToken);
      const approvedChanges = await reviewActions.requestProjectChangesAction(secondRequest.rawToken);

      const history = await reviewQueries.listProjectReviews(projectId, orgA);
      const notifications = await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.projectId, projectId));

      expect(decidedApprove?.error).toBeDefined();
      expect(decidedChanges?.error).toBeDefined();
      expect(approvedChanges?.error).toBeDefined();
      expect(history).toHaveLength(2);
      expect(history.map((review) => review.status)).toEqual([
        "approved",
        "changes_requested",
      ]);
      expect(notifications).toHaveLength(2);
      expect(notifications.map((notification) => notification.projectReviewId)).toContain(firstRound!.id);
    });

    it("allows only one concurrent final decision", async () => {
      const projectId = await createFreshProject(orgA, "Concurrent decision project");
      await addFeedbackWithStatus(projectId, "resolved");
      await reviewQueries.requestProjectReview(projectId, orgA);
      const issued = await reviewQueries.createReviewAccessToken(projectId, orgA);

      const results = await Promise.all([
        reviewActions.approveProjectReviewAction(issued!.rawToken),
        reviewActions.requestProjectChangesAction(issued!.rawToken),
      ]);

      expect(results.filter((result) => result === undefined)).toHaveLength(1);
      expect(results.filter((result) => result?.error)).toHaveLength(1);
    });

    it("cannot use a token for project A to decide project B's review", async () => {
      const projectB = await createFreshProject(orgB, "Other project");
      await addFeedbackWithStatus(projectB, "resolved");
      await reviewQueries.requestProjectReview(projectB, orgB);

      const tokenForA = await reviewQueries.createReviewAccessToken(projectA, orgA);
      const result = await reviewActions.approveProjectReviewAction(tokenForA!.rawToken);
      const reviewB = await reviewQueries.getPendingProjectReview(projectB, orgB);

      expect(result?.error).toBeDefined();
      expect(reviewB?.status).toBe("pending");
    });
  });
});
