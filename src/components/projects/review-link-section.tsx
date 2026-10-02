"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createReviewLinkAction, revokeReviewLinksAction } from "@/lib/review/actions";

/**
 * Deliberately simple: one "Create review link" action and one "Revoke
 * access" action, no list of individual tokens to manage (see the
 * Client Review Portal report's token-UI decision). The raw token only
 * ever exists in this component's own state — it is never written
 * anywhere that could show it again after a refresh, so the warning
 * about copying it now is not just UX polish, it's true.
 */
export function ReviewLinkSection({
  projectId,
  initialHasActiveLink,
}: {
  projectId: string;
  initialHasActiveLink: boolean;
}) {
  const [hasActiveLink, setHasActiveLink] = useState(initialHasActiveLink);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsPending(true);
    setError(null);

    const result = await createReviewLinkAction(projectId);

    if ("error" in result) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    setCreatedUrl(result.url);
    setHasActiveLink(true);
    setCopied(false);
    setIsPending(false);
  };

  const handleRevoke = async () => {
    setIsPending(true);
    setError(null);

    const result = await revokeReviewLinksAction(projectId);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    setHasActiveLink(false);
    setCreatedUrl(null);
    setIsPending(false);
  };

  const handleCopy = async () => {
    if (!createdUrl) return;

    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail; the link is still selectable by hand.
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground">Review link</h2>
      <p className="max-w-lg text-sm text-muted-foreground">
        Share this link with your client so they can review feedback on this project without
        creating an account.
      </p>

      {createdUrl ? (
        <div className="flex max-w-lg flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <code className="overflow-x-auto text-xs break-all">{createdUrl}</code>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
          <p className="text-xs text-destructive">
            This link won&apos;t be shown again after you leave this page — copy it now.
          </p>
        </div>
      ) : hasActiveLink ? (
        <p className="text-sm text-muted-foreground">
          A review link is active for this project. Create a new one to get another copyable
          link, or revoke access to disable every existing link immediately.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No review link has been created yet.</p>
      )}

      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending} onClick={handleCreate}>
          Create review link
        </Button>
        {hasActiveLink ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleRevoke}
          >
            Revoke access
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
