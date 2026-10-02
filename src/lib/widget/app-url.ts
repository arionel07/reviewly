import { headers } from "next/headers";

/**
 * The current app's own origin, derived from the incoming request
 * rather than a hardcoded production domain — so the install snippet
 * shown on the project page is correct in local dev, preview, and
 * production alike.
 */
export async function getAppBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (isLocalHost ? "http" : "https");

  return `${protocol}://${host}`;
}
