import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app-shell/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireWorkspace } from "@/lib/auth/session";
import { listClients } from "@/lib/clients/queries";

export const metadata: Metadata = {
  title: "Clients — Reviewly",
};

export default async function ClientsPage() {
  const { organizationId } = await requireWorkspace();
  const clients = await listClients(organizationId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Manage the clients you work with."
        action={<Button render={<Link href="/clients/new" />}>New client</Button>}
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start organizing projects and feedback."
          action={<Button render={<Link href="/clients/new" />}>Add client</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(client.createdAt, "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
