"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  projectSchema,
  projectStatusValues,
  type ProjectInput,
} from "@/lib/projects/schemas";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectForm({
  defaultValues,
  clients,
  showStatus = false,
  onSubmit,
  submitLabel,
  pendingLabel,
}: {
  defaultValues: ProjectInput;
  clients: { id: string; name: string }[];
  showStatus?: boolean;
  onSubmit: (values: ProjectInput) => Promise<{ error: string } | undefined>;
  submitLabel: string;
  pendingLabel: string;
}) {
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const handleSubmit = async (values: ProjectInput) => {
    const result = await onSubmit(values);

    // The Server Action redirects on success (throwing Next's internal
    // redirect signal), so reaching here means it returned an error.
    if (result?.error) {
      form.setError("root", { message: result.error });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  const clientNameById = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <form
      className="flex max-w-sm flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-name">Project name</Label>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              id="project-name"
              type="text"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? "project-name-error" : undefined}
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
          <p id="project-name-error" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-client">Client</Label>
        <Controller
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="project-client"
                className="w-full"
                aria-invalid={!!form.formState.errors.clientId}
                aria-describedby={
                  form.formState.errors.clientId ? "project-client-error" : undefined
                }
                onBlur={field.onBlur}
              >
                <SelectValue>
                  {(value: string | null) =>
                    value ? clientNameById.get(value) ?? value : "Select a client"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.clientId ? (
          <p id="project-client-error" className="text-sm text-destructive">
            {form.formState.errors.clientId.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="project-website-url">Website URL</Label>
        <Controller
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <Input
              id="project-website-url"
              type="url"
              placeholder="https://staging.acme.com"
              aria-invalid={!!form.formState.errors.websiteUrl}
              aria-describedby={
                form.formState.errors.websiteUrl ? "project-website-url-error" : undefined
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
        {form.formState.errors.websiteUrl ? (
          <p id="project-website-url-error" className="text-sm text-destructive">
            {form.formState.errors.websiteUrl.message}
          </p>
        ) : null}
      </div>

      {showStatus ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="project-status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger id="project-status" className="w-full" onBlur={field.onBlur}>
                  <SelectValue>
                    {(value: string | null) => (value ? STATUS_LABELS[value] ?? value : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projectStatusValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status] ?? status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

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
