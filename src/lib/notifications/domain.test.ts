import { describe, expect, it } from "vitest";

import { getNotificationHref } from "./domain";

describe("notification destinations", () => {
  it("opens feedback notifications on feedback detail", () => {
    expect(
      getNotificationHref({
        projectId: "project-1",
        feedbackId: "feedback-1",
        projectReviewId: null,
      }),
    ).toBe("/projects/project-1/feedback/feedback-1");
  });

  it("opens project notifications on project detail", () => {
    expect(
      getNotificationHref({
        projectId: "project-1",
        feedbackId: null,
        projectReviewId: "review-1",
      }),
    ).toBe("/projects/project-1");
  });

  it("falls back to the dashboard when no project is attached", () => {
    expect(
      getNotificationHref({ projectId: null, feedbackId: null, projectReviewId: null }),
    ).toBe("/dashboard");
  });
});
