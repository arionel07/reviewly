import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
    </div>
  );
}
