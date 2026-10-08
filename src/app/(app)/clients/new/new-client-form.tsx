"use client";

import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "@/lib/clients/actions";

export function NewClientForm() {
  return (
    <ClientForm
      defaultValues={{ name: "", email: undefined }}
      submitLabel="Create client"
      pendingLabel="Creating client…"
      layout="dialog"
      cancelHref="/clients"
      onSubmit={(values) => createClientAction(values)}
    />
  );
}
