import { expect, type Page } from "@playwright/test";

/** Shared agency-side setup steps used by both the widget and review-portal E2E suites. */

export async function signUpAndCreateWorkspace(
  page: Page,
  { name, email, workspaceName }: { name: string; email: string; workspaceName: string },
) {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/onboarding");
  await page.getByLabel("Workspace name").fill(workspaceName);
  await page.getByRole("button", { name: "Create workspace" }).click();
  await page.waitForURL("**/dashboard");
}

export async function createClient(page: Page, name: string) {
  await page.goto("/clients/new");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create client" }).click();
  await page.waitForURL(/\/clients\/[0-9a-f-]+$/);
}

export async function createActiveProject(
  page: Page,
  { name, clientName, websiteUrl }: { name: string; clientName: string; websiteUrl: string },
) {
  await page.goto("/projects/new");
  await page.getByLabel("Project name").fill(name);
  await page.locator("#project-client").click();
  await page.getByRole("option", { name: clientName }).click();
  await page.getByLabel("Website URL").fill(websiteUrl);
  await page.getByRole("button", { name: "Create project" }).click();
  await page.waitForURL(/\/projects\/[0-9a-f-]+$/);
  const projectUrl = page.url();

  // New projects default to "draft" — the widget only accepts
  // submissions for an "active" project.
  await page.goto(`${projectUrl}/edit`);
  await page.locator("#project-status").click();
  await page.getByRole("option", { name: "Active", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForURL(projectUrl);

  const publicKey = await page
    .locator("pre code")
    .textContent()
    .then((text) => {
      const match = text?.match(/data-project-key="(pk_[^"]+)"/);
      if (!match) throw new Error("Could not find project public key on the project page.");
      return match[1];
    });

  return { projectUrl, publicKey };
}

/** Creates a manual (dashboard-side) feedback item and returns its detail page URL. */
export async function createManualFeedback(
  page: Page,
  projectUrl: string,
  { message, pageUrl }: { message: string; pageUrl: string },
) {
  await page.goto(`${projectUrl}/feedback/new`);
  await page.getByLabel("Message").fill(message);
  await page.getByLabel("Page URL").fill(pageUrl);
  await page.getByRole("button", { name: "Add feedback" }).click();
  await page.waitForURL(/\/feedback\/[0-9a-f-]+$/);
  return page.url();
}

export async function resolveFeedback(page: Page, feedbackDetailUrl: string) {
  await page.goto(feedbackDetailUrl);
  await page.getByRole("button", { name: "Resolve" }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeVisible();
}

/** Creates a review link from the Project detail page and returns the raw URL. */
export async function createReviewLink(page: Page, projectUrl: string): Promise<string> {
  await page.goto(projectUrl);
  await page.getByRole("button", { name: "Create review link" }).click();
  const linkLocator = page.locator("code", { hasText: "/r/" });
  await expect(linkLocator).toBeVisible();
  const url = await linkLocator.textContent();
  if (!url) throw new Error("Could not read the generated review link.");
  return url.trim();
}

/** Requests a new project-level client review round and returns its fresh link. */
export async function requestProjectReview(page: Page, projectUrl: string): Promise<string> {
  await page.goto(projectUrl);
  await page.getByRole("button", { name: /Request review(?: again)?/ }).click();
  await expect(page.getByText("In review", { exact: true })).toBeVisible();
  const linkLocator = page.locator("code", { hasText: "/r/" });
  await expect(linkLocator).toBeVisible();
  const url = await linkLocator.textContent();

  if (!url) throw new Error("Could not read the generated review link.");
  return url.trim();
}
