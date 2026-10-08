"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Apple, GitFork, Globe2, Shield } from "lucide-react";

import { AuthBrand } from "@/components/auth/auth-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { signUpSchema, type SignUpInput } from "@/lib/auth/schemas";

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignUpInput) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Could not create your account. Please try again.",
      });
      return;
    }

    router.push("/onboarding");
  };

  const isSubmitting = form.formState.isSubmitting;

  const showProviderNotice = (provider: string) => {
    form.setError("root", {
      message: `${provider} sign-up is not configured for this workspace yet.`,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center"><AuthBrand /></div>
      <h1 className="mt-7 text-center text-[24px] font-bold tracking-[-0.05em] text-[#111216]">Create a Reviewly account</h1>
      <form
        className="mt-7 flex flex-col gap-5"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2">
          <Label className="text-[13px] font-semibold text-[#111216]" htmlFor="name">Name</Label>
          <Input className="h-12 rounded-full border-[#d7dae2] bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(17,18,22,0.03)] focus-visible:border-[#168ff0] focus-visible:ring-[#168ff0]" id="name" type="text" autoComplete="name" aria-invalid={!!form.formState.errors.name} aria-describedby={form.formState.errors.name ? "name-error" : undefined} disabled={isSubmitting} {...form.register("name")} />
          {form.formState.errors.name ? <p id="name-error" className="text-[12px] text-destructive">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[13px] font-semibold text-[#111216]" htmlFor="email">Email</Label>
          <Input className="h-12 rounded-full border-[#d7dae2] bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(17,18,22,0.03)] focus-visible:border-[#168ff0] focus-visible:ring-[#168ff0]" id="email" type="email" autoComplete="email" aria-invalid={!!form.formState.errors.email} aria-describedby={form.formState.errors.email ? "email-error" : undefined} disabled={isSubmitting} {...form.register("email")} />
          {form.formState.errors.email ? <p id="email-error" className="text-[12px] text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[13px] font-semibold text-[#111216]" htmlFor="password">Password</Label>
          <Input className="h-12 rounded-full border-[#d7dae2] bg-white px-4 text-[14px] shadow-[0_1px_2px_rgba(17,18,22,0.03)] focus-visible:border-[#168ff0] focus-visible:ring-[#168ff0]" id="password" type="password" autoComplete="new-password" aria-invalid={!!form.formState.errors.password} aria-describedby={form.formState.errors.password ? "password-error" : undefined} disabled={isSubmitting} {...form.register("password")} />
          {form.formState.errors.password ? <p id="password-error" className="text-[12px] text-destructive">{form.formState.errors.password.message}</p> : null}
        </div>

        <p className="px-3 text-center text-[12px] leading-[1.55] text-[#66707d]">By continuing, you agree to the <a className="underline underline-offset-2" href="#terms">Terms</a> and <a className="underline underline-offset-2" href="#privacy">Privacy Policy</a>.</p>
        {form.formState.errors.root ? <p role="alert" className="-mt-2 text-[12px] text-destructive">{form.formState.errors.root.message}</p> : null}
        <Button type="submit" className="h-12 w-full rounded-full bg-[#118ff0] text-[15px] font-bold text-white shadow-none hover:bg-[#087fda]" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</Button>
      </form>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e0e2e8]" /><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#969ca6]">or</span><span className="h-px flex-1 bg-[#e0e2e8]" /></div>
      <button className="h-11 rounded-full bg-[#eff0f3] text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#e5e7eb]" type="button" onClick={() => showProviderNotice("SSO")}><span className="inline-flex items-center gap-2"><Shield className="size-4" /> Continue with SSO</span></button>
      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#e0e2e8]" /><span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#969ca6]">or</span><span className="h-px flex-1 bg-[#e0e2e8]" /></div>
      <div className="flex flex-col gap-2"><button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("Google")}><Globe2 className="size-4 text-[#4285f4]" /> Continue with Google</button><button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("GitHub")}><GitFork className="size-4 text-[#626a76]" /> Continue with GitHub</button><button className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d5d8e0] bg-white text-[14px] font-semibold text-[#24272d] transition-colors hover:bg-[#f5f6f8]" type="button" onClick={() => showProviderNotice("Apple")}><Apple className="size-4 fill-current" /> Continue with Apple</button></div>

      <p className="mt-7 text-center text-[13px] text-[#68707d]">Already have an account? <Link href="/sign-in" className="font-semibold text-[#087ee8] hover:underline">Log in</Link></p>
    </div>
  );
}
