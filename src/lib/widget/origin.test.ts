import { describe, expect, it } from "vitest";

import { isDevOrigin, isOriginAllowedForProject, originMatchesWebsite } from "./origin";

describe("originMatchesWebsite", () => {
  it("matches the same origin regardless of path", () => {
    expect(originMatchesWebsite("https://staging.acme.com", "https://staging.acme.com/anything")).toBe(
      true,
    );
  });

  it("rejects a different host", () => {
    expect(originMatchesWebsite("https://attacker.example", "https://staging.acme.com")).toBe(false);
  });

  it("rejects a different scheme", () => {
    expect(originMatchesWebsite("http://staging.acme.com", "https://staging.acme.com")).toBe(false);
  });

  it("rejects a different port", () => {
    expect(originMatchesWebsite("https://staging.acme.com:8080", "https://staging.acme.com")).toBe(
      false,
    );
  });

  it("rejects a missing origin", () => {
    expect(originMatchesWebsite(null, "https://staging.acme.com")).toBe(false);
  });
});

describe("isDevOrigin", () => {
  it("accepts localhost at any port", () => {
    expect(isDevOrigin("http://localhost:5500")).toBe(true);
  });

  it("accepts 127.0.0.1", () => {
    expect(isDevOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("rejects a production-looking domain", () => {
    expect(isDevOrigin("https://staging.acme.com")).toBe(false);
  });

  it("rejects a domain merely containing 'localhost'", () => {
    expect(isDevOrigin("https://localhost.attacker.example")).toBe(false);
  });
});

describe("isOriginAllowedForProject", () => {
  const websiteUrl = "https://staging.acme.com";

  it("allows the configured website origin", () => {
    expect(isOriginAllowedForProject("https://staging.acme.com", websiteUrl)).toBe(true);
  });

  it("rejects an unrelated origin", () => {
    expect(isOriginAllowedForProject("https://attacker.example", websiteUrl)).toBe(false);
  });

  it("allows localhost even when the project's website is a different domain", () => {
    expect(isOriginAllowedForProject("http://localhost:5500", websiteUrl)).toBe(true);
  });

  it("allows a missing Origin header — only a real cross-origin request ever carries one", () => {
    expect(isOriginAllowedForProject(null, websiteUrl)).toBe(true);
  });
});
