import { describe, expect, it } from "vitest";

import { projectDecisionText, reviewRequestedText } from "./templates";

describe("transactional email text", () => {
  it("includes the review link and project context", () => {
    const text = reviewRequestedText({
      projectName: "Acme Website",
      workspaceName: "Acme Studio",
      reviewUrl: "https://app.example.com/r/raw-token",
    });

    expect(text).toContain("Acme Studio has asked you to review Acme Website.");
    expect(text).toContain("https://app.example.com/r/raw-token");
  });

  it.each([
    ["approved", "The client approved Acme Website."],
    ["changes_requested", "The client requested another revision for Acme Website."],
  ] as const)("describes a %s decision without a review token", (decision, expected) => {
    const text = projectDecisionText({
      projectName: "Acme Website",
      projectUrl: "https://app.example.com/projects/project-id",
      decision,
    });

    expect(text).toContain(expected);
    expect(text).toContain("https://app.example.com/projects/project-id");
    expect(text).not.toContain("/r/");
  });
});
