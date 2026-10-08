import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 items-start justify-center bg-[#fafafd] px-5 py-20 sm:px-6 sm:py-[84px]">
      <div className="flex w-full max-w-[352px] flex-col">{children}</div>
    </div>
  );
}
