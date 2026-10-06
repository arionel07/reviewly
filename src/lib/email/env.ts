export type EmailEnv = {
  apiKey: string;
  from: string;
  appUrl: string;
};

/**
 * Email configuration is read only when a send is attempted. This keeps
 * unrelated routes, tests, and builds usable without Resend credentials.
 */
export function readEmailEnv(): EmailEnv {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const appUrl = process.env.APP_URL?.trim();

  if (!apiKey || !from || !appUrl) {
    throw new Error("Email delivery is not configured.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(appUrl);
  } catch {
    throw new Error("Email delivery is not configured.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Email delivery is not configured.");
  }

  return { apiKey, from, appUrl: parsedUrl.toString().replace(/\/+$/, "") };
}
