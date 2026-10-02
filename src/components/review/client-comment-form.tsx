"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitClientCommentAction } from "@/lib/review/actions";
import { clientCommentSchema, type ClientCommentInput } from "@/lib/review/schemas";

/**
 * The client has no Better Auth account — name (+ optional email) is
 * the only identity collected, matching feedback_comment's existing
 * anonymous-author columns. authorUserId is never a field here; it
 * cannot be submitted because the form never collects or sends one.
 */
export function ClientCommentForm({
  token,
  feedbackId,
}: {
  token: string;
  feedbackId: string;
}) {
  const router = useRouter();
  const form = useForm<ClientCommentInput>({
    resolver: zodResolver(clientCommentSchema),
    defaultValues: { authorName: "", authorEmail: "", body: "" },
  });

  const onSubmit = async (values: ClientCommentInput) => {
    const result = await submitClientCommentAction(token, feedbackId, values);

    if (result?.error) {
      form.setError("root", { message: result.error });
      return;
    }

    form.reset({ authorName: values.authorName, authorEmail: values.authorEmail, body: "" });
    router.refresh();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      className="flex flex-col gap-3"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="comment-name">Name</Label>
          <Input
            id="comment-name"
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.authorName}
            {...form.register("authorName")}
          />
          {form.formState.errors.authorName ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.authorName.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="comment-email">Email (optional)</Label>
          <Input
            id="comment-email"
            type="email"
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.authorEmail}
            {...form.register("authorEmail")}
          />
          {form.formState.errors.authorEmail ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.authorEmail.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="comment-body">Comment</Label>
        <Textarea
          id="comment-body"
          rows={3}
          placeholder="Add a comment…"
          disabled={isSubmitting}
          aria-invalid={!!form.formState.errors.body}
          {...form.register("body")}
        />
        {form.formState.errors.body ? (
          <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
        ) : null}
      </div>

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
