import type { NextRequest } from "next/server";

import { MemoryRateLimiter } from "@/lib/rate-limit/memory-rate-limiter";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Public widget mutation endpoints only — authenticated dashboard Server
 * Actions are never subject to this policy (see AGENTS.md's Widget
 * Security section: the widget is an untrusted public client, a signed-in
 * workspace member is not).
 */
export const widgetFeedbackRateLimiter = new MemoryRateLimiter(20, ONE_HOUR_MS);

/**
 * Upload authorization gets a higher ceiling than feedback submission
 * itself — a legitimate user can retry a failed upload a few times
 * before giving up — but it is still bounded, since each call also costs
 * an R2 presigned-URL generation.
 */
export const widgetUploadRateLimiter = new MemoryRateLimiter(40, ONE_HOUR_MS);

/**
 * `projectKey + IP` — scoped to a single project so one noisy client
 * can't exhaust another project's budget, and to an IP (rather than
 * nothing) so a single visitor can't bypass the project-wide limit by
 * simply retrying. Not a strong identity (IPs are shared behind NAT/
 * corporate proxies, and `x-forwarded-for` is attacker-controlled on any
 * request that didn't pass through a trusted proxy) — it's a basic abuse
 * throttle, not an authentication mechanism.
 */
export function widgetRateLimitKey(projectKey: string, request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  return `${projectKey}:${ip}`;
}
