"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
}: {
  defaultValues: ClientInput;
  onSubmit: (values: ClientInput) => Promise<{ error: string } | undefined>;
  submitLabel: string;
  pendingLabel: string;
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
      className="flex max-w-sm flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="client-name">Name</Label>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              id="client-name"
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

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
