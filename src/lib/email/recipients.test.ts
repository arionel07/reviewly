import { describe, expect, it } from "vitest";

import { deduplicateEmailAddresses } from "./recipient-utils";

describe("email recipients", () => {
  it("trims, removes empty values, and deduplicates case-insensitively", () => {
    expect(
      deduplicateEmailAddresses([
        " owner@example.com ",
        null,
        "OWNER@example.com",
        "member@example.com",
        "",
        undefined,
      ]),
    ).toEqual(["owner@example.com", "member@example.com"]);
  });
});
