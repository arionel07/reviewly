import { describe, expect, it } from "vitest";

import {
  getProjectReviewStatusLabel,
  isBlockingFeedbackStatus,
} from "./project-review";

describe("project review domain", () => {
  it.each(["open", "in_progress", "reopened"] as const)(
    "treats %s feedback as blocking",
    (status) => {
      expect(isBlockingFeedbackStatus(status)).toBe(true);
    },
  );

  it("treats resolved feedback as non-blocking", () => {
    expect(isBlockingFeedbackStatus("resolved")).toBe(false);
  });

  it("keeps the product labels distinct from database values", () => {
    expect(getProjectReviewStatusLabel("pending")).toBe("In review");
    expect(getProjectReviewStatusLabel("changes_requested")).toBe("Changes requested");
    expect(getProjectReviewStatusLabel("approved")).toBe("Approved");
  });
});
