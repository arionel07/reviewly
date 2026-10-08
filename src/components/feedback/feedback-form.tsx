"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { feedbackSchema, type FeedbackInput } from "@/lib/feedback/schemas";

export function FeedbackForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
  layout = "page",
  cancelHref,
}: {
  defaultValues: FeedbackInput;
  onSubmit: (values: FeedbackInput) => Promise<{ error: string } | undefined>;
  submitLabel: string;
  pendingLabel: string;
  layout?: "page" | "dialog";
  cancelHref?: string;
}) {
  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues,
  });

  const handleSubmit = async (values: FeedbackInput) => {
    const result = await onSubmit(values);

    // The Server Action redirects on success (throwing Next's internal
    // redirect signal), so reaching here means it returned an error.
    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      className={layout === "dialog" ? "flex w-full flex-col gap-5" : "flex max-w-lg flex-col gap-4"}
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-message">Message</Label>
        <Textarea
          id="feedback-message"
          rows={5}
          aria-invalid={!!form.formState.errors.message}
          aria-describedby={form.formState.errors.message ? "feedback-message-error" : undefined}
          disabled={isSubmitting}
          {...form.register("message")}
        />
        {form.formState.errors.message ? (
          <p id="feedback-message-error" className="text-sm text-destructive">
            {form.formState.errors.message.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-page-url">Page URL</Label>
        <Controller
          control={form.control}
          name="pageUrl"
          render={({ field }) => (
            <Input
              id="feedback-page-url"
              type="url"
              placeholder="https://staging.acme.com/pricing"
              aria-invalid={!!form.formState.errors.pageUrl}
              aria-describedby={
                form.formState.errors.pageUrl ? "feedback-page-url-error" : undefined
              }
              disabled={isSubmitting}
              name={field.name}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {form.formState.errors.pageUrl ? (
          <p id="feedback-page-url-error" className="text-sm text-destructive">
            {form.formState.errors.pageUrl.message}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feedback-author-name">Reported by (optional)</Label>
          <Controller
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <Input
                id="feedback-author-name"
                type="text"
                disabled={isSubmitting}
                name={field.name}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feedback-author-email">Reporter email (optional)</Label>
          <Controller
            control={form.control}
            name="authorEmail"
            render={({ field }) => (
              <Input
                id="feedback-author-email"
                type="email"
                aria-invalid={!!form.formState.errors.authorEmail}
                aria-describedby={
                  form.formState.errors.authorEmail ? "feedback-author-email-error" : undefined
                }
                disabled={isSubmitting}
                name={field.name}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {form.formState.errors.authorEmail ? (
            <p id="feedback-author-email-error" className="text-sm text-destructive">
              {form.formState.errors.authorEmail.message}
            </p>
          ) : null}
        </div>
      </div>

      {form.formState.errors.root ? (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <div className={layout === "dialog" ? "flex flex-col-reverse gap-2 sm:flex-row" : undefined}>
        {layout === "dialog" && cancelHref ? (
          <Button variant="secondary" className="flex-1" render={<Link href={cancelHref} />}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className={layout === "dialog" ? "flex-1" : undefined} disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
