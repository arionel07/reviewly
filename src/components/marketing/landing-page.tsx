"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  GitFork,
  Layers3,
  Menu,
  MessageSquareText,
  MousePointer2,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

const workflowSteps = [
  {
    id: "collect",
    eyebrow: "01 / Collect",
    title: "Feedback with a place attached.",
    description:
      "Your clients point at the exact element they mean. Reviewly captures the page, selector, viewport, and screenshot automatically.",
    icon: MousePointer2,
  },
  {
    id: "resolve",
    eyebrow: "02 / Resolve",
    title: "Every comment stays in context.",
    description:
      "Turn scattered messages into a clear queue for your team. Reply, assign a status, and keep the conversation next to the work.",
    icon: MessageSquareText,
  },
  {
    id: "approve",
    eyebrow: "03 / Approve",
    title: "A clear yes when the work is ready.",
    description:
      "Share one secure review link. Clients can approve a project or request changes without making an account.",
    icon: CircleCheck,
  },
] as const;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.05em] text-[#101115]">
      <span className="relative flex size-7 items-center justify-center rounded-[9px] bg-[#111216] text-white shadow-[0_4px_10px_rgba(17,18,22,0.14)]">
        <span className="absolute left-[7px] top-[8px] h-[11px] w-[11px] rotate-45 rounded-[3px] border-[2px] border-white border-b-0 border-l-0" />
        <span className="absolute bottom-[7px] left-[7px] h-[2px] w-[13px] rotate-[-43deg] rounded-full bg-white" />
      </span>
      {!compact ? "Reviewly" : null}
    </span>
  );
}

function ReviewCanvas() {
  return (
    <div className="relative mx-auto w-full max-w-[910px] px-1 sm:px-5">
      <div className="absolute -inset-5 rounded-[38px] bg-[#f7f8fb] blur-2xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-[#dfe2e8] bg-white shadow-[0_24px_80px_rgba(40,44,55,0.14)]">
        <div className="flex h-11 items-center justify-between border-b border-[#eceef2] px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-[#f1b4b2]" />
              <span className="size-2 rounded-full bg-[#f1d9a9]" />
              <span className="size-2 rounded-full bg-[#a9dcbf]" />
            </div>
            <span className="hidden text-[11px] font-semibold text-[#8d929e] sm:block">
              acme.studio / homepage
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#737986]">
            <span className="rounded-full bg-[#f0f1f4] px-2.5 py-1">Live preview</span>
            <span className="hidden rounded-full border border-[#e5e7ec] px-2.5 py-1 sm:block">Share</span>
          </div>
        </div>

        <div className="relative grid min-h-[310px] grid-cols-[1fr_190px] overflow-hidden bg-[#fbfbfc] sm:min-h-[430px] sm:grid-cols-[1fr_240px]">
          <div className="relative overflow-hidden border-r border-[#e9ebef] bg-white p-5 sm:p-9">
            <div className="mx-auto max-w-[470px]">
              <div className="mb-14 flex items-center justify-between border-b border-[#edeef1] pb-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#16181c]">
                  <span className="flex size-5 items-center justify-center rounded-md bg-[#15161a] text-[9px] text-white">A</span>
                  Acme
                </div>
                <div className="hidden gap-4 text-[10px] font-semibold text-[#9095a0] sm:flex">
                  <span>Work</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
                <div className="size-5 rounded-full bg-[#f0f1f4] sm:hidden" />
              </div>
              <div className="max-w-[320px]">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#4684ef]">New collection</span>
                <h3 className="text-[27px] font-bold leading-[1.04] tracking-[-0.07em] text-[#17191e] sm:text-[42px]">
                  Make space for better ideas.
                </h3>
                <p className="mt-4 max-w-[260px] text-[11px] leading-[1.65] text-[#7b808b] sm:text-[13px]">
                  A simple place to gather feedback, refine the details, and ship work you&apos;re proud of.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="rounded-full bg-[#111216] px-3.5 py-2 text-[10px] font-bold text-white">Explore work</span>
                  <span className="rounded-full border border-[#e3e5e9] px-3.5 py-2 text-[10px] font-bold text-[#737883]">About us</span>
                </div>
              </div>
              <div className="mt-16 grid grid-cols-3 gap-2.5 sm:mt-24">
                <div className="h-14 rounded-xl bg-[#eef2f6] sm:h-20" />
                <div className="h-14 rounded-xl bg-[#e7e9ed] sm:h-20" />
                <div className="h-14 rounded-xl bg-[#f2eee9] sm:h-20" />
              </div>
            </div>

            <span className="absolute left-[42%] top-[34%] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#4f8cf2] text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(56,119,231,0.35)]">1</span>
            <span className="absolute left-[62%] top-[67%] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#f09c65] text-[10px] font-bold text-white shadow-[0_4px_12px_rgba(240,156,101,0.35)]">2</span>
          </div>

          <div className="bg-[#f8f9fb] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#292c33]">Feedback</span>
              <span className="flex size-5 items-center justify-center rounded-full bg-[#e9ebef] text-[#8a909b]">+</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="rounded-xl border border-[#d7e5ff] bg-white p-3 shadow-[0_3px_10px_rgba(45,70,111,0.06)]">
                <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-[#5788e2]"><span>Open</span><span>now</span></div>
                <p className="text-[11px] font-semibold leading-[1.35] text-[#252832]">Could we make the hero headline a little larger?</p>
                <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#8b919c]"><span className="size-3 rounded-full bg-[#bad3ff]" /> arsen</div>
              </div>
              <div className="rounded-xl border border-[#e5e7ec] bg-white p-3 opacity-80">
                <div className="mb-2 flex items-center justify-between text-[9px] font-bold text-[#8e949f]"><span>Resolved</span><span>2h</span></div>
                <p className="text-[11px] font-semibold leading-[1.35] text-[#343841]">The mobile spacing feels great.</p>
                <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#8b919c]"><span className="size-3 rounded-full bg-[#d8b8ff]" /> maya</div>
              </div>
            </div>
            <div className="mt-8 hidden rounded-xl border border-dashed border-[#d9dde5] p-3 sm:block">
              <div className="mb-2 h-1.5 w-16 rounded-full bg-[#dfe3ea]" />
              <div className="h-1.5 w-full rounded-full bg-[#eef0f4]" />
              <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-[#eef0f4]" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#eceef2] px-4 py-3 text-[10px] text-[#858b97] sm:px-5">
          <span>2 comments on this page</span>
          <span className="flex items-center gap-1.5 font-semibold text-[#4f8cf2]"><Sparkles className="size-3" /> Ready for review</span>
        </div>
      </div>
    </div>
  );
}

function WorkflowPreview({ activeStep }: { activeStep: string }) {
  if (activeStep === "approve") {
    return (
      <div className="relative flex h-full min-h-[330px] items-center justify-center overflow-hidden bg-[#f5f7fb] p-6 sm:min-h-[420px]">
        <div className="absolute left-1/2 top-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dce5f7]" />
        <div className="absolute left-1/2 top-1/2 size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#cbd8ef]" />
        <div className="relative z-10 w-full max-w-[285px] rounded-[22px] border border-[#dfe3ea] bg-white p-5 shadow-[0_18px_50px_rgba(31,52,89,0.11)]">
          <div className="flex items-center justify-between border-b border-[#edf0f4] pb-4">
            <div><p className="text-[11px] font-bold text-[#20232a]">Project review</p><p className="mt-1 text-[10px] text-[#8c929e]">Acme homepage · Round 2</p></div>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e4f7ed] text-[#27a36b]"><Check className="size-4" /></span>
          </div>
          <div className="flex flex-col gap-3 py-5">
            <div className="flex items-center gap-2.5 text-[11px] text-[#6f7683]"><span className="flex size-5 items-center justify-center rounded-full bg-[#e4f7ed] text-[#28a16c]"><Check className="size-3" /></span> 8 feedback items resolved</div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#6f7683]"><span className="flex size-5 items-center justify-center rounded-full bg-[#e4f7ed] text-[#28a16c]"><Check className="size-3" /></span> Client invited to review</div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#6f7683]"><span className="flex size-5 items-center justify-center rounded-full bg-[#e4f7ed] text-[#28a16c]"><Check className="size-3" /></span> Secure link is active</div>
          </div>
          <div className="rounded-xl bg-[#111216] px-4 py-3 text-center text-[11px] font-bold text-white">Approved by client</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[330px] overflow-hidden bg-[#f5f7fb] p-5 sm:min-h-[420px] sm:p-8">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(#d7deea 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative mx-auto flex max-w-[370px] flex-col gap-3 pt-4 sm:pt-9">
        <div className="flex items-center justify-between rounded-xl border border-[#dfe4ed] bg-white px-3.5 py-3 shadow-[0_10px_30px_rgba(32,54,91,0.07)]">
          <div className="flex items-center gap-2.5"><span className="flex size-7 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#4d87e9]"><Layers3 className="size-3.5" /></span><span className="text-[11px] font-bold text-[#31353e]">Acme homepage</span></div>
          <span className="text-[10px] font-semibold text-[#9298a3]">2 days ago</span>
        </div>
        <div className="relative ml-8 rounded-xl border border-[#dfe4ed] bg-white p-4 shadow-[0_10px_30px_rgba(32,54,91,0.07)] sm:ml-14">
          <div className="absolute -left-8 top-8 h-px w-8 bg-[#b6c7e3] sm:-left-14 sm:w-14" />
          <div className="mb-3 flex items-center gap-2"><span className="size-5 rounded-full bg-[#bad4ff]" /><span className="text-[10px] font-bold text-[#666d79]">Maya left feedback</span></div>
          <p className="text-[13px] font-bold tracking-[-0.03em] text-[#262a33]">Can we make this section feel more spacious?</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8c929d]"><MessageSquareText className="size-3.5" /> Hero section · open</div>
        </div>
        <div className="ml-16 flex items-center gap-2 text-[10px] font-semibold text-[#6b7280] sm:ml-28"><span className="size-1.5 rounded-full bg-[#4f8cf2]" /> Comment pinned to the page</div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState("collect");
  const activeWorkflow = workflowSteps.find((step) => step.id === activeStep) ?? workflowSteps[0];
  const ActiveIcon = activeWorkflow.icon;

  return (
    <main className="overflow-hidden bg-white text-[#111216]">
      <header className="sticky top-0 z-40 border-b border-[#eceef2]/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Reviewly home"><BrandMark /></Link>
          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#5e6470] lg:flex">
            <Link className="transition-colors hover:text-[#111216]" href="/product">Product</Link>
            <a className="flex items-center gap-1 transition-colors hover:text-[#111216]" href="#workflow">Solutions <ChevronDown className="size-3.5" /></a>
            <a className="flex items-center gap-1 transition-colors hover:text-[#111216]" href="#resources">Resources <ChevronDown className="size-3.5" /></a>
            <Link className="transition-colors hover:text-[#111216]" href="/pricing">Pricing</Link>
          </nav>
          <div className="hidden items-center gap-2.5 lg:flex">
            <a className="flex items-center gap-2 px-2.5 text-[13px] font-semibold text-[#5e6470] transition-colors hover:text-[#111216]" href="https://github.com/arionel07/reviewly" target="_blank" rel="noreferrer"><GitFork className="size-4" /> Open source <ArrowUpRight className="size-3.5" /></a>
            <Link className="rounded-full border border-[#d9dce3] px-4 py-2 text-[13px] font-bold transition-colors hover:bg-[#f7f7f8]" href="/sign-in">Log in</Link>
            <Link className="rounded-full bg-[#111216] px-4 py-2 text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5" href="/sign-up">Sign up</Link>
          </div>
          <button className="flex size-10 items-center justify-center rounded-full border border-[#e4e6eb] lg:hidden" type="button" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        {mobileMenuOpen ? (
          <div className="border-t border-[#eceef2] bg-white px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-1 text-[14px] font-semibold text-[#5e6470]">
              {["Product", "Workflow", "Resources", "Pricing"].map((item) => <Link key={item} className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href={item === "Product" ? "/product" : item === "Pricing" ? "/pricing" : `#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>{item}</Link>)}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#eceef2] pt-4"><Link className="rounded-full border border-[#d9dce3] px-4 py-3 text-center text-[13px] font-bold" href="/sign-in">Log in</Link><Link className="rounded-full bg-[#111216] px-4 py-3 text-center text-[13px] font-bold text-white" href="/sign-up">Sign up</Link></div>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:px-10 lg:pt-28">
        <div className="mx-auto max-w-[960px] text-center">
          <h1 className="mx-auto max-w-[790px] text-[48px] font-bold leading-[0.98] tracking-[-0.08em] text-[#111216] sm:text-[72px] lg:text-[88px]">Build better work<br /><span className="text-[#8c929d]">with better feedback.</span></h1>
          <p className="mx-auto mt-7 max-w-[535px] text-[16px] leading-[1.55] text-[#656b77] sm:text-[18px]">Reviewly gives agencies one calm place to collect visual feedback, resolve the details, and get client approval.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111216] px-5 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(17,18,22,0.14)] transition-transform hover:-translate-y-0.5" href="/sign-up">Get started <ArrowRight className="size-4" /></Link>
            <a className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f0f1f4] px-5 py-3 text-[14px] font-bold text-[#22252b] transition-colors hover:bg-[#e7e8ec]" href="#workflow">See how it works</a>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-[1120px] sm:mt-20"><ReviewCanvas /></div>
        <div className="mx-auto mt-12 flex max-w-[780px] flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-[#eceef2] pt-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b919c] sm:mt-16">
          <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#424852]" /> Secure review links</span>
          <span className="flex items-center gap-2"><MessageSquareText className="size-4 text-[#424852]" /> Context-rich feedback</span>
          <span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#424852]" /> Simple approvals</span>
        </div>
      </section>

      <section id="product" className="border-y border-[#eceef2] bg-[#fafbfc] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-24">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6f7784]">The review loop</p>
            <h2 className="mt-5 max-w-[480px] text-[40px] font-bold leading-[1.02] tracking-[-0.07em] sm:text-[56px]">Less chasing.<br />More shipping.</h2>
            <p className="mt-6 max-w-[400px] text-[16px] leading-[1.6] text-[#6d737f]">Keep client conversations connected to the work so your team always knows what changed, what matters, and what comes next.</p>
            <Link className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#111216] underline decoration-[#cdd2dc] underline-offset-4 hover:decoration-[#111216]" href="/sign-up">Bring your next project in <ArrowRight className="size-4" /></Link>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-[#e1e4ea] bg-white shadow-[0_20px_60px_rgba(38,43,52,0.07)]">
            <div className="flex flex-wrap gap-2 border-b border-[#eceef2] p-3 sm:p-4">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                return <button key={step.id} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-colors ${isActive ? "bg-[#111216] text-white" : "text-[#777e8a] hover:bg-[#f4f5f7]"}`} type="button" aria-pressed={isActive} onClick={() => setActiveStep(step.id)}><Icon className="size-3.5" /> <span className="hidden sm:inline">{step.id[0].toUpperCase() + step.id.slice(1)}</span></button>;
              })}
            </div>
            <div className="grid md:grid-cols-[0.82fr_1.18fr]">
              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7b8390]"><ActiveIcon className="size-3.5" /> {activeWorkflow.eyebrow}</div><h3 className="mt-5 text-[28px] font-bold leading-[1.05] tracking-[-0.06em] sm:text-[36px]">{activeWorkflow.title}</h3><p className="mt-4 text-[14px] leading-[1.6] text-[#737a86]">{activeWorkflow.description}</p></div>
                <div className="mt-10 flex items-center gap-2 text-[11px] font-bold text-[#3e4653]"><Clock3 className="size-3.5 text-[#7795c3]" /> Built for the way agencies work</div>
              </div>
              <WorkflowPreview activeStep={activeStep} />
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-[640px] text-center"><p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6f7784]">Made for the details</p><h2 className="mt-5 text-[40px] font-bold leading-[1.04] tracking-[-0.07em] sm:text-[58px]">Everything clients need<br />to say yes.</h2><p className="mt-6 text-[16px] leading-[1.6] text-[#6d737f]">A focused toolkit for the last mile between “almost there” and “approved.”</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <article className="rounded-[24px] border border-[#e1e4ea] bg-[#fafbfc] p-6 sm:p-7"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#e6efff] text-[#4f88ee]"><MousePointer2 className="size-5" /></div><h3 className="mt-16 text-[23px] font-bold tracking-[-0.06em]">Point at the problem.</h3><p className="mt-3 text-[14px] leading-[1.6] text-[#707783]">Capture feedback directly on the live page, with the exact context your team needs to act.</p><div className="mt-8 flex items-center gap-2 text-[12px] font-bold text-[#4f88ee]">Visual context <ArrowUpRight className="size-3.5" /></div></article>
            <article className="rounded-[24px] border border-[#e1e4ea] bg-[#fafbfc] p-6 sm:p-7"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff0e6] text-[#e28e59]"><MessageSquareText className="size-5" /></div><h3 className="mt-16 text-[23px] font-bold tracking-[-0.06em]">Keep the thread close.</h3><p className="mt-3 text-[14px] leading-[1.6] text-[#707783]">Reply to comments, track progress, and give every request a clear status from open to resolved.</p><div className="mt-8 flex items-center gap-2 text-[12px] font-bold text-[#e28e59]">One source of truth <ArrowUpRight className="size-3.5" /></div></article>
            <article className="rounded-[24px] border border-[#e1e4ea] bg-[#fafbfc] p-6 sm:p-7"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#e9f7ef] text-[#27a06b]"><CircleCheck className="size-5" /></div><h3 className="mt-16 text-[23px] font-bold tracking-[-0.06em]">Finish with a yes.</h3><p className="mt-3 text-[14px] leading-[1.6] text-[#707783]">Invite clients into a simple portal where they can approve the whole project or request changes.</p><div className="mt-8 flex items-center gap-2 text-[12px] font-bold text-[#27a06b]">Approval rounds <ArrowUpRight className="size-3.5" /></div></article>
          </div>
        </div>
      </section>

      <section id="resources" className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <div className="mx-auto grid max-w-[1120px] overflow-hidden rounded-[30px] bg-[#111216] text-white lg:grid-cols-[0.86fr_1.14fr]">
          <div className="flex flex-col justify-between p-7 sm:p-12 lg:p-16"><div><p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8e96a5]">One link for the final mile</p><h2 className="mt-5 max-w-[430px] text-[40px] font-bold leading-[1.02] tracking-[-0.07em] sm:text-[54px]">Make approval feel easy.</h2><p className="mt-6 max-w-[400px] text-[16px] leading-[1.6] text-[#a6acb8]">No new account. No lost email thread. Just a secure review link and a clear next step.</p></div><Link className="mt-12 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold text-[#111216] transition-transform hover:-translate-y-0.5" href="/sign-up">Create your first project <ArrowRight className="size-4" /></Link></div>
          <div className="relative min-h-[390px] overflow-hidden bg-[#181a20] p-5 sm:p-10"><div className="absolute -right-16 -top-16 size-64 rounded-full border border-[#323741]" /><div className="absolute -bottom-24 -left-10 size-72 rounded-full border border-[#2a2e37]" /><div className="relative mx-auto mt-6 max-w-[440px] rounded-[24px] border border-[#353a46] bg-[#20232b] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.3)] sm:mt-12 sm:p-6"><div className="flex items-center justify-between border-b border-[#373c48] pb-4"><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-white text-[12px] font-black text-[#111216]">R</span><div><p className="text-[12px] font-bold">Acme website</p><p className="mt-0.5 text-[10px] text-[#8e95a2]">Client review portal</p></div></div><span className="rounded-full bg-[#253b32] px-2.5 py-1 text-[10px] font-bold text-[#73d39d]">In review</span></div><div className="py-5"><div className="flex items-center justify-between text-[10px] font-bold text-[#9299a6]"><span>Review progress</span><span className="text-white">8 / 8 resolved</span></div><div className="mt-3 flex gap-1.5">{Array.from({ length: 8 }).map((_, index) => <span key={index} className="h-2 flex-1 rounded-full bg-[#62c895]" />)}</div><div className="mt-6 rounded-2xl border border-[#3a404c] bg-[#272b34] p-4"><div className="flex items-center gap-2 text-[11px] font-bold"><span className="flex size-6 items-center justify-center rounded-full bg-[#d8c1ff] text-[#4c346e]">M</span> Maya left a final note</div><p className="mt-3 text-[13px] font-semibold leading-[1.45] text-[#eceef3]">Everything looks good on our side. Ready to approve.</p></div></div><div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-[12px] font-bold text-[#111216]"><span>Approve project</span><Check className="size-4" /></div></div></div>
        </div>
      </section>

      <section id="pricing" className="border-t border-[#eceef2] px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[900px] text-center"><h2 className="text-[44px] font-bold leading-[1.02] tracking-[-0.08em] sm:text-[72px]">Ready to make feedback<br /><span className="text-[#8c929d]">feel lighter?</span></h2><p className="mx-auto mt-6 max-w-[470px] text-[16px] leading-[1.6] text-[#6d737f]">Start with one project. Bring your team in when the workflow clicks.</p><Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111216] px-5 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(17,18,22,0.14)] transition-transform hover:-translate-y-0.5" href="/sign-up">Get started free <ArrowRight className="size-4" /></Link><div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[11px] font-semibold text-[#8b919c]"><span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#41ac78]" /> No credit card</span><span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#41ac78]" /> Client accounts not required</span><span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#41ac78]" /> Start in minutes</span></div></div></section>

      <footer className="border-t border-[#eceef2] px-5 py-10 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"><div><Link href="/"><BrandMark /></Link><p className="mt-4 max-w-[240px] text-[13px] leading-[1.5] text-[#7b828e]">Visual feedback and client approval for teams that care about the details.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[13px] sm:grid-cols-3"><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Product</span><a className="text-[#747b87] hover:text-[#111216]" href="#product">How it works</a><a className="text-[#747b87] hover:text-[#111216]" href="#workflow">Features</a></div><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Resources</span><a className="text-[#747b87] hover:text-[#111216]" href="/sign-up">Get started</a><a className="text-[#747b87] hover:text-[#111216]" href="https://github.com/arionel07/reviewly" target="_blank" rel="noreferrer">GitHub</a></div><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Account</span><Link className="text-[#747b87] hover:text-[#111216]" href="/sign-in">Log in</Link><Link className="text-[#747b87] hover:text-[#111216]" href="/dashboard">Dashboard</Link></div></div></div><div className="mx-auto mt-10 flex max-w-[1120px] flex-col gap-3 border-t border-[#eceef2] pt-5 text-[11px] text-[#8b919c] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Reviewly. Built for better reviews.</span><span className="flex items-center gap-2"><Send className="size-3.5" /> Make every comment count.</span></div></footer>
    </main>
  );
}
