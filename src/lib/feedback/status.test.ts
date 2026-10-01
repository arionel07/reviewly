import { describe, expect, it } from "vitest";

import {
  canTransitionFeedbackStatus,
  getAvailableFeedbackTransitions,
} from "./status";

describe("canTransitionFeedbackStatus", () => {
  const allowed: [string, string][] = [
    ["open", "in_progress"],
    ["open", "resolved"],
    ["in_progress", "resolved"],
    ["resolved", "reopened"],
    ["reopened", "in_progress"],
    ["reopened", "resolved"],
  ];

  it.each(allowed)("allows %s -> %s", (from, to) => {
    expect(
      canTransitionFeedbackStatus(from as never, to as never),
    ).toBe(true);
  });

  const disallowed: [string, string][] = [
    ["open", "reopened"],
    ["in_progress", "open"],
    ["in_progress", "reopened"],
    ["resolved", "open"],
    ["resolved", "in_progress"],
    ["reopened", "open"],
    ["open", "open"],
    ["resolved", "resolved"],
  ];

  it.each(disallowed)("disallows %s -> %s", (from, to) => {
    expect(
      canTransitionFeedbackStatus(from as never, to as never),
    ).toBe(false);
  });

  it("never allows a transition to or from a status outside the current enum", () => {
    // No "approved"/"closed"/"blocked"/"archived" — see docs/DECISIONS.md
    // ADR-010. getAvailableFeedbackTransitions only ever returns values
    // from the current four-value enum.
    const allTargets = ["open", "in_progress", "resolved", "reopened"].flatMap(
      (status) => getAvailableFeedbackTransitions(status as never),
    );

    for (const target of allTargets) {
      expect(["open", "in_progress", "resolved", "reopened"]).toContain(target);
    }
  });
});

describe("getAvailableFeedbackTransitions", () => {
  it("returns the exact transitions for each status", () => {
    expect(getAvailableFeedbackTransitions("open")).toEqual(["in_progress", "resolved"]);
    expect(getAvailableFeedbackTransitions("in_progress")).toEqual(["resolved"]);
    expect(getAvailableFeedbackTransitions("resolved")).toEqual(["reopened"]);
    expect(getAvailableFeedbackTransitions("reopened")).toEqual(["in_progress", "resolved"]);
  });
});
