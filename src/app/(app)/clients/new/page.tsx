import type { Metadata } from "next";

import { RouteDialog } from "@/components/app-shell/route-dialog";

import { NewClientForm } from "./new-client-form";

export const metadata: Metadata = {
  title: "New client — Reviewly",
};

export default function NewClientPage() {
  return (
    <RouteDialog
      title="Create a client"
      description="Add a client to your workspace."
      backHref="/clients"
    >
      <NewClientForm />
    </RouteDialog>
  );
}
