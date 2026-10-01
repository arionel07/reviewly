import type { Metadata } from "next";

import { PageHeader } from "@/components/app-shell/page-header";

import { NewClientForm } from "./new-client-form";

export const metadata: Metadata = {
  title: "New client — Reviewly",
};

export default function NewClientPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader title="New client" description="Add a client to your workspace" />
      <NewClientForm />
    </div>
  );
}
