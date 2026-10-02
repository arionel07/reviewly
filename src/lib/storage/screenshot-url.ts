import { getObjectStorage } from "@/lib/storage/r2-object-storage";

/**
 * Signs a short-lived GET URL for a feedback screenshot's R2 object key.
 * Never persisted — generated fresh on every render (see
 * docs/DATABASE.md's "Screenshot storage" note) — and never thrown past
 * this boundary: R2 being unconfigured (e.g. in local dev without the
 * R2_* env vars) or unreachable should hide the screenshot, not break
 * the Feedback detail page. Callers are responsible for having already
 * verified the caller may see this feedback (see getFeedback's
 * organization-scoped lookup) before calling this — it does no
 * authorization of its own.
 */
export async function getFeedbackScreenshotUrl(screenshotKey: string): Promise<string | null> {
  try {
    return await getObjectStorage().createPresignedGetUrl({ key: screenshotKey });
  } catch (error) {
    console.error("[storage] failed to sign a screenshot URL", error);
    return null;
  }
}
