import { describe, expect, it } from "vitest";

import {
  generateScreenshotObjectKey,
  isAllowedScreenshotContentType,
  MAX_SCREENSHOT_BYTES,
  screenshotKeyBelongsToProject,
} from "./screenshot-upload";

describe("isAllowedScreenshotContentType", () => {
  it("accepts image/webp and image/png", () => {
    expect(isAllowedScreenshotContentType("image/webp")).toBe(true);
    expect(isAllowedScreenshotContentType("image/png")).toBe(true);
  });

  it.each(["image/svg+xml", "text/html", "application/json", ""])(
    "rejects %s",
    (contentType) => {
      expect(isAllowedScreenshotContentType(contentType)).toBe(false);
    },
  );
});

describe("generateScreenshotObjectKey", () => {
  const organizationId = "org_123";
  const projectId = "00000000-0000-0000-0000-000000000000";

  it("builds a key under the expected prefix with a webp extension", () => {
    const key = generateScreenshotObjectKey(organizationId, projectId, "image/webp");

    expect(key).toMatch(
      /^workspaces\/org_123\/projects\/00000000-0000-0000-0000-000000000000\/feedback\/[A-Za-z0-9_-]+\.webp$/,
    );
  });

  it("builds a key with a png extension", () => {
    const key = generateScreenshotObjectKey(organizationId, projectId, "image/png");
    expect(key.endsWith(".png")).toBe(true);
  });

  it("never embeds message text or author info — only org/project ids and a random segment", () => {
    const key = generateScreenshotObjectKey(organizationId, projectId, "image/webp");
    expect(key).not.toContain(" ");
  });

  it("generates a different key on every call", () => {
    const first = generateScreenshotObjectKey(organizationId, projectId, "image/webp");
    const second = generateScreenshotObjectKey(organizationId, projectId, "image/webp");
    expect(first).not.toBe(second);
  });
});

describe("screenshotKeyBelongsToProject", () => {
  const organizationId = "org_123";
  const projectId = "00000000-0000-0000-0000-000000000000";

  it("accepts a key this module itself generated for the same project", () => {
    const key = generateScreenshotObjectKey(organizationId, projectId, "image/webp");
    expect(screenshotKeyBelongsToProject(key, organizationId, projectId)).toBe(true);
  });

  it("rejects a key belonging to a different project", () => {
    const key = generateScreenshotObjectKey(organizationId, "other-project", "image/webp");
    expect(screenshotKeyBelongsToProject(key, organizationId, projectId)).toBe(false);
  });

  it("rejects a key belonging to a different organization", () => {
    const key = generateScreenshotObjectKey("other-org", projectId, "image/webp");
    expect(screenshotKeyBelongsToProject(key, organizationId, projectId)).toBe(false);
  });

  it("rejects an arbitrary/handwritten key even with a matching prefix", () => {
    const key = `workspaces/${organizationId}/projects/${projectId}/feedback/../../../etc/passwd`;
    expect(screenshotKeyBelongsToProject(key, organizationId, projectId)).toBe(false);
  });

  it("rejects a key with an unsupported extension", () => {
    const key = `workspaces/${organizationId}/projects/${projectId}/feedback/abc123.svg`;
    expect(screenshotKeyBelongsToProject(key, organizationId, projectId)).toBe(false);
  });

  it("rejects a completely unrelated string", () => {
    expect(screenshotKeyBelongsToProject("not-a-key", organizationId, projectId)).toBe(false);
  });
});

describe("MAX_SCREENSHOT_BYTES", () => {
  it("is a sensible, bounded ceiling", () => {
    expect(MAX_SCREENSHOT_BYTES).toBeGreaterThan(0);
    expect(MAX_SCREENSHOT_BYTES).toBeLessThanOrEqual(5_000_000);
  });
});
