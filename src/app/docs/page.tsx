import type { Metadata } from "next";

import { DocsPage } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Docs — Reviewly",
  description: "Learn how to collect feedback and get client approval with Reviewly.",
};

export default function DocsRoute() {
  return <DocsPage />;
}
