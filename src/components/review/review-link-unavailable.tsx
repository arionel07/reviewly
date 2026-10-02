/**
 * The one state every public portal route renders for an invalid
 * token — expired, revoked, malformed, or simply unknown all look
 * identical here on purpose (see the task's "do not reveal why a link
 * doesn't work" requirement). findProjectByReviewToken returning null
 * is the only signal any route acts on.
 */
export function ReviewLinkUnavailable() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
      <h1 className="text-lg font-medium text-foreground">Review link unavailable</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This review link isn&apos;t valid. Ask the agency you&apos;re working with for a new
        one.
      </p>
    </div>
  );
}
