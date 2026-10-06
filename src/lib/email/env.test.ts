import { afterEach, describe, expect, it } from "vitest";

import { readEmailEnv } from "./env";

const originalValues = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_URL: process.env.APP_URL,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalValues)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("email environment", () => {
  it("reads complete transactional email configuration lazily", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Reviewly <noreply@example.com>";
    process.env.APP_URL = "https://app.example.com/";

    expect(readEmailEnv()).toMatchObject({
      apiKey: "re_test_key",
      from: "Reviewly <noreply@example.com>",
      appUrl: "https://app.example.com",
    });
  });

  it("rejects incomplete or unsafe configuration at send time", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Reviewly <noreply@example.com>";
    process.env.APP_URL = "javascript:alert(1)";

    expect(() => readEmailEnv()).toThrow("Email delivery is not configured.");
  });
});
