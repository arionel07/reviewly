import { expect, test, type Page } from "@playwright/test";

/**
 * The defining Phase 1 widget test: install on a page, select an
 * element, submit feedback through the widget, and see it land in the
 * existing Reviewly project UI — using the real app end to end, no
 * mocking.
 */

async function signUpAndCreateWorkspace(
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

async function createClient(page: Page, name: string) {
  await page.goto("/clients/new");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create client" }).click();
  await page.waitForURL(/\/clients\/[0-9a-f-]+$/);
}

async function createActiveProject(
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

test.describe("widget", () => {
  test("full flow: install, select, submit, appears in Reviewly", async ({ page }) => {
    const suffix = Date.now();

    await signUpAndCreateWorkspace(page, {
      name: "Widget Tester",
      email: `widget-${suffix}@example.com`,
      workspaceName: "Widget Workspace",
    });
    await createClient(page, "Acme Inc.");
    const { projectUrl, publicKey } = await createActiveProject(page, {
      name: "Acme Website",
      clientName: "Acme Inc.",
      // Intentionally a different domain than where the playground is
      // actually served (localhost) — this only works because of the
      // dev-origin bypass, exercising that path for real.
      websiteUrl: "https://staging.acme.com",
    });

    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    const feedbackButton = page.locator("reviewly-widget").locator("button.rw-button");
    await expect(feedbackButton).toBeVisible();
    await expect(feedbackButton).toHaveText("Feedback");

    await feedbackButton.click();
    await expect(feedbackButton).toHaveText("Cancel");

    const target = page.locator("#signup-button");
    await target.hover();
    await target.click();

    const composer = page.locator("reviewly-widget").locator(".rw-composer");
    await expect(composer).toBeVisible();
    await expect(composer.locator(".rw-composer-target")).toContainText("signup-button");

    // Capture itself succeeds here (real html2canvas, lazily loaded) —
    // the status line reflects that immediately. Upload (which happens
    // later, only at submit time) is a separate step: no R2 credentials
    // exist in this test environment (see the Widget Phase 2 report's
    // "Do not make E2E depend on production R2" note), so it silently
    // fails and feedback still submits successfully without a
    // screenshotKey — see the next assertions.
    await expect(composer.locator(".rw-composer-screenshot-status")).toHaveText("✓ Captured", {
      timeout: 5000,
    });

    await composer.locator("textarea").fill("Make this button larger");
    await composer.getByRole("button", { name: "Send" }).click();

    await expect(composer.locator(".rw-composer-success")).toHaveText("Feedback sent");
    await expect(composer).toBeHidden({ timeout: 3000 });

    await page.goto(`${projectUrl}/feedback`);
    await expect(page.getByText("Make this button larger")).toBeVisible();
    await expect(page.getByText("Open", { exact: true }).first()).toBeVisible();

    await page.getByText("Make this button larger").click();
    await expect(page.getByText("Element text")).toBeVisible();
    // Upload failed (no R2 credentials in this environment), so no
    // screenshotKey was ever persisted — the Screenshot section must not
    // render, rather than rendering a broken image.
    await expect(page.getByRole("heading", { name: "Screenshot" })).toHaveCount(0);
  });

  test("Escape cancels inspect mode and never uploads", async ({ page }) => {
    const uploadRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/widget/uploads")) {
        uploadRequests.push(request.url());
      }
    });

    const publicKey = await seedActiveProjectPublicKey(page, "escape");
    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    const feedbackButton = page.locator("reviewly-widget").locator("button.rw-button");
    await feedbackButton.click();
    await expect(feedbackButton).toHaveText("Cancel");

    await page.keyboard.press("Escape");
    await expect(feedbackButton).toHaveText("Feedback");
    await page.waitForTimeout(300);

    expect(uploadRequests).toHaveLength(0);
  });

  test("Cancel closes the composer and never uploads", async ({ page }) => {
    const uploadRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/widget/uploads")) {
        uploadRequests.push(request.url());
      }
    });

    const publicKey = await seedActiveProjectPublicKey(page, "cancel");
    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    await page.locator("reviewly-widget").locator("button.rw-button").click();
    await page.locator("#signup-button").click();

    const composer = page.locator("reviewly-widget").locator(".rw-composer");
    await expect(composer).toBeVisible();

    // Give capture a moment to run before cancelling — the point of this
    // test is that even a successful capture is never uploaded once the
    // composer is cancelled, not that capture never started.
    await page.waitForTimeout(500);

    await composer.getByRole("button", { name: "Cancel" }).click();
    await expect(composer).toBeHidden();
    await page.waitForTimeout(300);

    expect(uploadRequests).toHaveLength(0);
  });

  test("clicking the widget's own button does not select it as feedback target", async ({
    page,
  }) => {
    const publicKey = await seedActiveProjectPublicKey(page, "self-select");
    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    const feedbackButton = page.locator("reviewly-widget").locator("button.rw-button");
    await feedbackButton.click();
    // Clicking the button again while inspecting should exit inspect
    // mode (its own click handler), never open a composer targeting
    // itself.
    await feedbackButton.click();

    await expect(feedbackButton).toHaveText("Feedback");
    await expect(page.locator("reviewly-widget").locator(".rw-composer")).toHaveCount(0);
  });

  test("screenshot capture failure still permits submitting feedback", async ({ page }) => {
    const publicKey = await seedActiveProjectPublicKey(page, "capture-fail");

    // Block the lazily-loaded screenshot library itself, simulating a
    // capture-level failure (not just an upload failure) — the message
    // the user typed must not be lost, and submission must still work.
    await page.route("**/widget/html2canvas.min.js", (route) => route.abort());

    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    await page.locator("reviewly-widget").locator("button.rw-button").click();
    await page.locator("#signup-button").click();

    const composer = page.locator("reviewly-widget").locator(".rw-composer");
    await expect(composer).toBeVisible();
    await expect(composer.locator(".rw-composer-screenshot-status")).toHaveText(
      "Screenshot unavailable — feedback can still be sent.",
      { timeout: 5000 },
    );

    await composer.locator("textarea").fill("Still works without a screenshot");
    await composer.getByRole("button", { name: "Send" }).click();

    await expect(composer.locator(".rw-composer-success")).toHaveText("Feedback sent");
  });

  test("a duplicate embed script does not create a second widget", async ({ page }) => {
    const publicKey = await seedActiveProjectPublicKey(page, "dupe");
    await page.goto(`/widget-playground.html?projectKey=${publicKey}`);

    await expect(page.locator("reviewly-widget")).toHaveCount(1);

    await page.evaluate((key) => {
      const script = document.createElement("script");
      script.src = "/widget/widget.js";
      script.setAttribute("data-project-key", key);
      document.body.appendChild(script);
    }, publicKey);

    await page.waitForTimeout(300);
    await expect(page.locator("reviewly-widget")).toHaveCount(1);
  });
});

async function seedActiveProjectPublicKey(page: Page, label: string): Promise<string> {
  const suffix = `${label}-${Date.now()}`;

  await signUpAndCreateWorkspace(page, {
    name: "Widget Tester",
    email: `widget-${suffix}@example.com`,
    workspaceName: `Widget Workspace ${suffix}`,
  });
  await createClient(page, "Acme Inc.");
  const { publicKey } = await createActiveProject(page, {
    name: "Acme Website",
    clientName: "Acme Inc.",
    websiteUrl: "https://staging.acme.com",
  });

  return publicKey;
}
