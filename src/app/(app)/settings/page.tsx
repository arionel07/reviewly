import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Reviewly",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-start justify-center gap-2 px-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
