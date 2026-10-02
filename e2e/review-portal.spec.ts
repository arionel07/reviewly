import { expect, test, type Page } from "@playwright/test";

import {
  createActiveProject,
  createClient,
  createManualFeedback,
  createReviewLink,
  resolveFeedback,
  signUpAndCreateWorkspace,
} from "./helpers";

/**
 * The critical Client Review Portal Phase 1 flow: an agency creates a
 * review link, an unauthenticated visitor opens it, views feedback and
 * a comment thread, reopens a resolved item, and the agency sees that
 * change reflected back in the dashboard — all through the real app,
 * no mocking.
 */

async function setUpProjectWithResolvedFeedback(page: Page, label: string) {
  const suffix = `${label}-${Date.now()}`;

  await signUpAndCreateWorkspace(page, {
    name: "Agency Owner",
    email: `review-${suffix}@example.com`,
    workspaceName: `Review Workspace ${suffix}`,
  });
  await createClient(page, "Acme Inc.");
  const { projectUrl } = await createActiveProject(page, {
    name: "Acme Website",
    clientName: "Acme Inc.",
    websiteUrl: "https://acme.example.com",
  });

  const feedbackUrl = await createManualFeedback(page, projectUrl, {
    message: "The hero image is cropped oddly on mobile",
    pageUrl: "https://acme.example.com/",
  });
  await resolveFeedback(page, feedbackUrl);

  return { projectUrl, feedbackUrl };
}

test.describe("client review portal", () => {
  test("full flow: create link, review as a client, reopen, agency sees it", async ({
    page,
    browser,
  }) => {
    const { projectUrl, feedbackUrl } = await setUpProjectWithResolvedFeedback(page, "full-flow");
    const reviewUrl = await createReviewLink(page, projectUrl);
    expect(reviewUrl).toMatch(/\/r\/[A-Za-z0-9_-]{43}$/);

    // A brand-new, cookie-less browser context — proves the portal needs
    // no Better Auth session at all.
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    await clientPage.goto(reviewUrl);
    await expect(clientPage.getByRole("heading", { name: "Acme Website" })).toBeVisible();
    await expect(clientPage.getByText("1", { exact: true }).first()).toBeVisible(); // Resolved count

    await clientPage.getByText("The hero image is cropped oddly on mobile").click();
    await expect(clientPage.getByText("Resolved", { exact: true }).first()).toBeVisible();

    await clientPage.getByLabel("Name").fill("Jordan Client");
    await clientPage.getByLabel("Comment").fill("Still looks off on my iPhone.");
    await clientPage.getByRole("button", { name: "Add comment" }).click();
    await expect(clientPage.getByText("Still looks off on my iPhone.")).toBeVisible();

    await clientPage.getByRole("button", { name: "Not fixed — reopen" }).click();
    await expect(clientPage.getByText("Reopened", { exact: true }).first()).toBeVisible();
    await expect(clientPage.getByRole("button", { name: "Not fixed — reopen" })).toHaveCount(0);

    await clientContext.close();

    // Back on the agency side: open the same feedback and see both changes.
    await page.goto(feedbackUrl);
    await expect(page.getByText("Still looks off on my iPhone.")).toBeVisible();
    await expect(page.getByText("Reopened", { exact: true }).first()).toBeVisible();
  });

  test("a revoked link stops working immediately", async ({ page, browser }) => {
    const { projectUrl } = await setUpProjectWithResolvedFeedback(page, "revoke");
    const reviewUrl = await createReviewLink(page, projectUrl);

    await page.goto(projectUrl);
    await page.getByRole("button", { name: "Revoke access" }).click();
    await expect(page.getByRole("button", { name: "Revoke access" })).toHaveCount(0);

    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto(reviewUrl);

    await expect(clientPage.getByText("Review link unavailable")).toBeVisible();
    await clientContext.close();
  });

  test("an unknown/invalid link shows the same neutral state", async ({ browser }) => {
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    await clientPage.goto("/r/this-is-not-a-real-token-at-all-00000000000");

    await expect(clientPage.getByText("Review link unavailable")).toBeVisible();
    await clientContext.close();
  });

  test("the portal works without any auth cookie", async ({ page, browser }) => {
    const { projectUrl } = await setUpProjectWithResolvedFeedback(page, "no-cookie");
    const reviewUrl = await createReviewLink(page, projectUrl);

    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    const cookiesBefore = await clientContext.cookies();
    expect(cookiesBefore).toHaveLength(0);

    const response = await clientPage.goto(reviewUrl);
    expect(response?.status()).toBe(200);
    await expect(clientPage.getByRole("heading", { name: "Acme Website" })).toBeVisible();

    const cookiesAfter = await clientContext.cookies();
    expect(cookiesAfter.some((cookie) => cookie.name.toLowerCase().includes("session"))).toBe(
      false,
    );

    await clientContext.close();
  });
});
