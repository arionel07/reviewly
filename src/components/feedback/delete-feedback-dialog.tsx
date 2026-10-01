"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteFeedbackAction } from "@/lib/feedback/actions";

export function DeleteFeedbackDialog({
  feedbackId,
  projectId,
}: {
  feedbackId: string;
  projectId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    // deleteFeedbackAction redirects to the feedback list on success
    // (throwing Next's internal redirect signal), so reaching the result
    // check below means it returned an error instead.
    const result = await deleteFeedbackAction(feedbackId, projectId);

    if (result?.error) {
      setError(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this feedback?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All comments on this feedback
            will also be deleted according to the current database
            cascade rules.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
