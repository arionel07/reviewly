import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireWorkspace: vi.fn(),
  getWorkspaceEmailRecipients: vi.fn(),
  sendReviewRequestedEmail: vi.fn(),
  sendProjectDecisionEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireWorkspace: mocks.requireWorkspace }));
vi.mock("@/lib/email/recipients", () => ({
  getWorkspaceEmailRecipients: mocks.getWorkspaceEmailRecipients,
}));
vi.mock("@/lib/email/send-email", () => ({
  sendReviewRequestedEmail: mocks.sendReviewRequestedEmail,
  sendProjectDecisionEmail: mocks.sendProjectDecisionEmail,
}));

describe.skipIf(!process.env.DATABASE_URL)("review email actions (integration)", () => {
  let db: typeof import("@/db").db;
  let schema: typeof import("@/db/schema");
  let clientQueries: typeof import("@/lib/clients/queries");
  let projectQueries: typeof import("@/lib/projects/queries");
  let feedbackQueries: typeof import("@/lib/feedback/queries");
  let reviewQueries: typeof import("./queries");
  let reviewActions: typeof import("./actions");
  let orgA: string;

  beforeAll(async () => {
    [db, schema, clientQueries, projectQueries, feedbackQueries, reviewQueries, reviewActions] =
      await Promise.all([
        import("@/db").then((module) => module.db),
        import("@/db/schema"),
        import("@/lib/clients/queries"),
        import("@/lib/projects/queries"),
        import("@/lib/feedback/queries"),
        import("./queries"),
        import("./actions"),
      ]);

    orgA = randomUUID();
    await db.insert(schema.organization).values({
      id: orgA,
      name: "Email Workspace",
      slug: `email-workspace-${orgA}`,
      createdAt: new Date(),
    });
    mocks.requireWorkspace.mockResolvedValue({ organizationId: orgA });
    mocks.getWorkspaceEmailRecipients.mockResolvedValue(["agency@example.com"]);
  });

  afterAll(async () => {
    await db.delete(schema.organization).where(eq(schema.organization.id, orgA));
  });

  beforeEach(() => {
    mocks.sendReviewRequestedEmail.mockReset();
    mocks.sendProjectDecisionEmail.mockReset();
    mocks.sendReviewRequestedEmail.mockResolvedValue({ sent: true });
    mocks.sendProjectDecisionEmail.mockResolvedValue({ sent: true });
  });

  async function createReadyProject(email: string | null = "client@example.com") {
    const client = await clientQueries.createClient(orgA, {
      name: "Email Client",
      ...(email === null ? {} : { email }),
    });
    const project = await projectQueries.createProject(orgA, {
      name: "Email Project",
      clientId: client.id,
      websiteUrl: "https://email.example.com",
      status: "active",
      publicKey: `pk_${randomUUID()}`,
    });
    const feedback = await feedbackQueries.insertFeedback(project.id, {
      message: "Resolved email feedback",
      pageUrl: "https://email.example.com/",
    });
    await feedbackQueries.updateFeedbackStatusInProject(feedback.id, project.id, "resolved");

    return project.id;
  }

  it("creates the review before attempting the client email", async () => {
    const projectId = await createReadyProject();
    const result = await reviewActions.requestProjectReviewAction(projectId);

    expect(result).toMatchObject({
      reviewCreated: true,
      emailSent: true,
      clientEmail: "client@example.com",
    });
    expect(mocks.sendReviewRequestedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@example.com",
        projectId,
        reviewUrl: expect.stringMatching(/\/r\/[A-Za-z0-9_-]{43}$/),
      }),
    );
    expect(await reviewQueries.getPendingProjectReview(projectId, orgA)).not.toBeNull();
  });

  it("keeps the review and token valid when request email delivery fails", async () => {
    mocks.sendReviewRequestedEmail.mockResolvedValue({ sent: false, reason: "provider_error" });
    const projectId = await createReadyProject();

    const result = await reviewActions.requestProjectReviewAction(projectId);

    expect(result).toMatchObject({ reviewCreated: true, emailSent: false, emailStatus: "failed" });
    expect(await reviewQueries.getPendingProjectReview(projectId, orgA)).not.toBeNull();
  });

  it("creates the review and reports a missing client email", async () => {
    mocks.sendReviewRequestedEmail.mockResolvedValue({ sent: false, reason: "no_recipient" });
    const projectId = await createReadyProject(null);

    const result = await reviewActions.requestProjectReviewAction(projectId);

    expect(result).toMatchObject({
      reviewCreated: true,
      emailSent: false,
      emailStatus: "no_client_email",
      clientEmail: null,
    });
  });

  it("resends a fresh token without creating another review round", async () => {
    const projectId = await createReadyProject();
    const first = await reviewActions.requestProjectReviewAction(projectId);
    const firstUrl = "reviewUrl" in first ? first.reviewUrl : "";
    const second = await reviewActions.resendProjectReviewLinkAction(projectId);
    const secondUrl = "reviewUrl" in second ? second.reviewUrl : "";

    expect(firstUrl).not.toBe(secondUrl);
    expect(await reviewQueries.listProjectReviews(projectId, orgA)).toHaveLength(1);
    expect(mocks.sendReviewRequestedEmail).toHaveBeenCalledTimes(2);
  });

  it("keeps an approval and in-app notification when agency email fails", async () => {
    mocks.sendProjectDecisionEmail.mockResolvedValue({ sent: false, reason: "provider_error" });
    const projectId = await createReadyProject();
    const requested = await reviewQueries.requestProjectReview(projectId, orgA);

    if (!("review" in requested)) throw new Error("Expected a pending review.");

    const approved = await reviewActions.approveProjectReviewAction(requested.rawToken);
    const review = await reviewQueries.getLatestProjectReview(projectId, orgA);
    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.projectId, projectId));

    expect(approved).toBeUndefined();
    expect(review?.status).toBe("approved");
    expect(notifications.map((item) => item.type)).toEqual(["review_approved"]);
    expect(mocks.sendProjectDecisionEmail).toHaveBeenCalledTimes(1);
  });

  it("does not allow another workspace to resend a link", async () => {
    const projectId = await createReadyProject();
    await reviewActions.requestProjectReviewAction(projectId);
    mocks.requireWorkspace.mockResolvedValue({ organizationId: randomUUID() });

    const result = await reviewActions.resendProjectReviewLinkAction(projectId);

    expect(result).toEqual({ error: "This project could not be found." });
    expect(mocks.sendReviewRequestedEmail).toHaveBeenCalledTimes(1);
    mocks.requireWorkspace.mockResolvedValue({ organizationId: orgA });
  });
});
