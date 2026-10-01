import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app-shell/page-header";
import { requireWorkspace } from "@/lib/auth/session";
import { getClient } from "@/lib/clients/queries";

import { EditClientForm } from "./edit-client-form";

export const metadata: Metadata = {
  title: "Edit client — Reviewly",
};

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { organizationId } = await requireWorkspace();
  const client = await getClient(clientId, organizationId);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="Edit client" description={client.name} />
      <EditClientForm
        clientId={client.id}
        defaultValues={{ name: client.name, email: client.email ?? undefined }}
      />
    </div>
  );
}
