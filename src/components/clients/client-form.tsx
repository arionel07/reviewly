"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientSchema, type ClientInput } from "@/lib/clients/schemas";

export function ClientForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
  layout = "page",
  cancelHref,
}: {
  defaultValues: ClientInput;
  onSubmit: (values: ClientInput) => Promise<{ error: string } | undefined>;
  submitLabel: string;
  pendingLabel: string;
  layout?: "page" | "dialog";
  cancelHref?: string;
}) {
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ClientInput) => {
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
      className={layout === "dialog" ? "flex w-full flex-col gap-5" : "flex max-w-sm flex-col gap-4"}
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client-name">{layout === "dialog" ? "Display name" : "Name"}</Label>
        {layout === "dialog" ? (
          <p className="text-sm text-muted-foreground">A human-readable name for your client.</p>
        ) : null}
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              id="client-name"
              aria-label={layout === "dialog" ? "Name" : undefined}
              type="text"
              autoComplete="organization"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? "client-name-error" : undefined}
              disabled={isSubmitting}
              name={field.name}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {form.formState.errors.name ? (
          <p id="client-name-error" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client-email">Email</Label>
        {layout === "dialog" ? (
          <p className="text-sm text-muted-foreground">Optional contact email for this client.</p>
        ) : null}
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <Input
              id="client-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? "client-email-error" : undefined}
              disabled={isSubmitting}
              name={field.name}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {form.formState.errors.email ? (
          <p id="client-email-error" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
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
