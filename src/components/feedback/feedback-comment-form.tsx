"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFeedbackCommentAction } from "@/lib/feedback/actions";
import {
  feedbackCommentSchema,
  type FeedbackCommentInput,
} from "@/lib/feedback/schemas";

export function FeedbackCommentForm({
  feedbackId,
  projectId,
}: {
  feedbackId: string;
  projectId: string;
}) {
  const router = useRouter();
  const form = useForm<FeedbackCommentInput>({
    resolver: zodResolver(feedbackCommentSchema),
    defaultValues: { body: "" },
  });

  const onSubmit = async (values: FeedbackCommentInput) => {
    const result = await createFeedbackCommentAction(feedbackId, projectId, values);

    if (result?.error) {
      form.setError("root", { message: result.error });
      return;
    }

    form.reset({ body: "" });
    router.refresh();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      className="flex flex-col gap-2"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Label htmlFor="comment-body" className="sr-only">
        Add a comment
      </Label>
      <Textarea
        id="comment-body"
        rows={3}
        placeholder="Add a comment…"
        aria-invalid={!!form.formState.errors.body}
        aria-describedby={form.formState.errors.body ? "comment-body-error" : undefined}
        disabled={isSubmitting}
        {...form.register("body")}
      />
      {form.formState.errors.body ? (
        <p id="comment-body-error" className="text-sm text-destructive">
          {form.formState.errors.body.message}
        </p>
      ) : null}
      {form.formState.errors.root ? (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add comment"}
        </Button>
      </div>
    </form>
  );
}
