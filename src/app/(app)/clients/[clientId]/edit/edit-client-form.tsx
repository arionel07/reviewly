"use client";

import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "@/lib/clients/actions";
import type { ClientInput } from "@/lib/clients/schemas";

export function EditClientForm({
  clientId,
  defaultValues,
}: {
  clientId: string;
  defaultValues: ClientInput;
}) {
  return (
    <ClientForm
      defaultValues={defaultValues}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      onSubmit={(values) => updateClientAction(clientId, values)}
    />
  );
}
