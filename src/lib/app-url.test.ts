import { afterEach, describe, expect, it } from "vitest";

import { buildAppUrl, getCanonicalAppUrl } from "./app-url";

const originalAppUrl = process.env.APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.APP_URL;
  } else {
    process.env.APP_URL = originalAppUrl;
  }
});

describe("canonical app URL", () => {
  it("normalizes a configured origin before building a path", () => {
    process.env.APP_URL = "https://app.example.com/";

    expect(getCanonicalAppUrl()).toBe("https://app.example.com");
    expect(buildAppUrl("/r/token")).toBe("https://app.example.com/r/token");
  });

  it("uses the local development origin when APP_URL is absent", () => {
    delete process.env.APP_URL;

    expect(buildAppUrl("projects/project-id")).toBe("http://localhost:3000/projects/project-id");
  });

  it("does not accept a non-http origin", () => {
    process.env.APP_URL = "javascript:alert(1)";

    expect(getCanonicalAppUrl()).toBe("http://localhost:3000");
  });
});
