"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Apple, GitFork, Globe2, KeyRound, Shield } from "lucide-react";

import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { signInSchema, type SignInInput } from "@/lib/auth/schemas";

export function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInInput) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Could not sign you in. Please try again.",
      });
      return;
    }

    // The dashboard route group decides, server-side, whether this session
    // has an active workspace yet — redirecting to /onboarding itself if not.
    router.push("/dashboard");
  };

  const isSubmitting = form.formState.isSubmitting;

  const showProviderNotice = (provider: string) => {
    form.setError("root", {
      message: `${provider} sign-in is not configured for this workspace yet.`,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center"><AuthBrand /></div>
      <h1 className="mt-7 text-center text-[24px] font-bold tracking-[-0.05em] text-[#111216]">Log in to Reviewly</h1>
      <form
        className="mt-7 flex flex-col gap-6"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <Label className="text-[13px] font-semibold text-[#111216]" htmlFor="email">Email</Label>
          <Input
            className="h-12 rounded-full border-[#d7dae2] bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(17,18,22,0.03)] focus-visible:border-[#168ff0] focus-visible:ring-[#168ff0]"
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            aria-describedby={form.formState.errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
            {...form.register("email")}
          />
          {form.formState.errors.email ? <p id="email-error" className="text-[12px] text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between"><Label className="text-[13px] font-semibold text-[#111216]" htmlFor="password">Password</Label><button className="text-[13px] font-semibold text-[#087ee8] hover:underline" type="button" onClick={() => showProviderNotice("Password recovery")}>Forgot password?</button></div>
          <Input
            className="h-12 rounded-full border-[#d7dae2] bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(17,18,22,0.03)] focus-visible:border-[#168ff0] focus-visible:ring-[#168ff0]"
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!form.formState.errors.password}
            aria-describedby={form.formState.errors.password ? "password-error" : undefined}
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {form.formState.errors.password ? <p id="password-error" className="text-[12px] text-destructive">{form.formState.errors.password.message}</p> : null}
        </div>

        {form.formState.errors.root ? <p role="alert" className="-mt-3 text-[12px] text-destructive">{form.formState.errors.root.message}</p> : null}

        <Button type="submit" className="h-12 w-full rounded-full bg-[#118ff0] text-[15px] font-bold text-white shadow-none hover:bg-[#087fda]" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e0e2e8]" /><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#969ca6]">or</span><span className="h-px flex-1 bg-[#e0e2e8]" /></div>

      <div className="flex flex-col gap-2">
        <button className="h-11 rounded-full bg-[#eff0f3] text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#e5e7eb]" type="button" onClick={() => showProviderNotice("SSO")}><span className="inline-flex items-center gap-2"><Shield className="size-4" /> Continue with SSO</span></button>
        <button className="h-11 rounded-full bg-[#eff0f3] text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#e5e7eb]" type="button" onClick={() => showProviderNotice("Passkey")}><span className="inline-flex items-center gap-2"><KeyRound className="size-4" /> Continue with passkey</span></button>
      </div>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e0e2e8]" /><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#969ca6]">or</span><span className="h-px flex-1 bg-[#e0e2e8]" /></div>

      <div className="flex flex-col gap-2">
        <button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("Google")}><Globe2 className="size-4 text-[#4285f4]" /> Continue with Google</button>
        <button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("GitHub")}><GitFork className="size-4 text-[#626a76]" /> Continue with GitHub</button>
        <button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("Apple")}><Apple className="size-4 fill-current" /> Continue with Apple</button>
      </div>

      <p className="mt-7 text-center text-[13px] text-[#68707d]">New to Reviewly? <Link href="/sign-up" className="font-semibold text-[#087ee8] hover:underline">Create an account</Link></p>
    </div>
  );
}
