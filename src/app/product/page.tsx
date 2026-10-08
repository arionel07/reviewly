"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  GitFork,
  Link2,
  Menu,
  MessageSquareText,
  MousePointer2,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const snippet = `<script src="/widget/widget.js" data-project-key="your-project-key"></script>`;

const featureCards = [
  {
    title: "Comments that point at the work",
    description: "Clients leave feedback on the exact page element, with the screenshot and context your team needs to act.",
    icon: MousePointer2,
  },
  {
    title: "See what changed between rounds",
    description: "Keep every status, reply, and resolved item together so nothing disappears into a long email thread.",
    icon: ClipboardCheck,
  },
  {
    title: "Requests that point at a decision",
    description: "Separate a small visual fix from a full review round and give the whole team a clear next action.",
    icon: MessageSquareText,
  },
  {
    title: "Answers for you, or your client",
    description: "A secure review link makes it easy for clients to comment, approve, or request changes without an account.",
    icon: Users,
  },
] as const;

const faqs = [
  {
    question: "How is Reviewly different from email or chat?",
    answer: "Reviewly keeps every comment attached to the exact page and element it describes. Your team gets the screenshot, URL, selector, browser context, and conversation together instead of reconstructing the request from a message.",
  },
  {
    question: "Can clients use Reviewly without an account?",
    answer: "Yes. Clients open a secure, project-scoped review link. They can inspect feedback, leave comments, request changes, and approve a review round without creating a Reviewly account.",
  },
  {
    question: "Does Reviewly work with websites that are still in progress?",
    answer: "That is the core workflow. Add the Reviewly widget to a staging or preview website, collect feedback while the work is in progress, and move the project through review rounds before launch.",
  },
  {
    question: "What happens when a client requests changes?",
    answer: "The review round records the decision and your team can continue resolving the linked feedback. Once the changes are ready, start another review round from the same project.",
  },
] as const;

function ProductMark() {
  return (
    <span className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.05em] text-[#101115]">
      <span className="relative flex size-7 items-center justify-center rounded-[9px] bg-[#111216] text-white shadow-[0_4px_10px_rgba(17,18,22,0.14)]">
        <span className="absolute left-[7px] top-[8px] h-[11px] w-[11px] rotate-45 rounded-[3px] border-[2px] border-white border-b-0 border-l-0" />
        <span className="absolute bottom-[7px] left-[7px] h-[2px] w-[13px] rotate-[-43deg] rounded-full bg-white" />
      </span>
      Reviewly
    </span>
  );
}

function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#eceef2]/90 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Reviewly home"><ProductMark /></Link>
        <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#5e6470] lg:flex">
          <Link className="flex items-center gap-1 transition-colors hover:text-[#111216]" href="/#resources">Docs <ArrowUpRight className="size-3.5" /></Link>
          <Link className="flex items-center gap-1 rounded-full bg-[#f0f1f4] px-3.5 py-2 text-[#111216]" href="/product">Product <ChevronDown className="size-3.5" /></Link>
          <Link className="flex items-center gap-1 transition-colors hover:text-[#111216]" href="/#workflow">Solutions <ChevronDown className="size-3.5" /></Link>
          <Link className="transition-colors hover:text-[#111216]" href="/#resources">Enterprise</Link>
          <Link className="transition-colors hover:text-[#111216]" href="/pricing">Pricing</Link>
          <Link className="transition-colors hover:text-[#111216]" href="/#resources">Blog</Link>
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
            <Link className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href="/#resources" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
            <Link className="rounded-xl bg-[#f0f1f4] px-3 py-3 text-[#111216]" href="/product" onClick={() => setMobileMenuOpen(false)}>Product</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href="/#workflow" onClick={() => setMobileMenuOpen(false)}>Solutions</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href="/#resources" onClick={() => setMobileMenuOpen(false)}>Enterprise</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link className="rounded-xl px-3 py-3 hover:bg-[#f5f6f8]" href="/#resources" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#eceef2] pt-4"><Link className="rounded-full border border-[#d9dce3] px-4 py-3 text-center text-[13px] font-bold" href="/sign-in">Log in</Link><Link className="rounded-full bg-[#111216] px-4 py-3 text-center text-[13px] font-bold text-white" href="/sign-up">Sign up</Link></div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function InstallSnippet() {
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="mx-auto flex max-w-full items-center gap-3 rounded-full border border-[#d9dce4] bg-[#f7f7f9] px-5 py-3 font-mono text-[12px] text-[#2f3540] shadow-[0_2px_0_rgba(17,18,22,0.02)] transition-colors hover:bg-[#f0f1f4]" type="button" onClick={copySnippet} aria-label="Copy Reviewly install snippet">
      <span className="text-[#858b97]">$</span><span className="truncate">Add the Reviewly widget to your site</span>{copied ? <Check className="size-4 shrink-0 text-[#2ca16e]" /> : <Link2 className="size-4 shrink-0 text-[#7b828f]" />}
    </button>
  );
}

const chartBars = [30, 48, 35, 65, 38, 78, 52, 47, 62, 42, 70, 56, 92, 44, 76, 58, 83, 54, 72, 63];

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[28px] border border-[#dce0e7] bg-white p-2 shadow-[0_26px_80px_rgba(32,39,51,0.2)] sm:p-3">
      <div className="absolute inset-0 -z-10 bg-[#12151a]" />
      <div className="relative overflow-hidden rounded-[21px] bg-[#fafbfd]">
        <div className="flex min-h-[480px] sm:min-h-[610px]">
          <aside className="hidden w-[184px] shrink-0 border-r border-[#e8ebf0] bg-[#f6f7f9] p-4 sm:block">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#252a32]"><span className="flex size-6 items-center justify-center rounded-lg bg-[#15171c] text-[9px] text-white">R</span> Reviewly</div>
            <div className="mt-7 flex flex-col gap-1 text-[10px] font-semibold text-[#7e8591]">
              <span className="mb-2 px-2 text-[9px] uppercase tracking-[0.12em] text-[#a0a6b0]">Workspace</span>
              <span className="rounded-lg bg-white px-2.5 py-2 text-[#242830] shadow-[0_1px_4px_rgba(25,33,47,0.06)]">Overview</span>
              <span className="px-2.5 py-2">Projects</span>
              <span className="px-2.5 py-2">Clients</span>
              <span className="px-2.5 py-2">Feedback</span>
              <span className="mt-5 mb-2 px-2 text-[9px] uppercase tracking-[0.12em] text-[#a0a6b0]">Manage</span>
              <span className="px-2.5 py-2">Review links</span>
              <span className="px-2.5 py-2">Notifications</span>
            </div>
            <div className="mt-28 border-t border-[#e5e8ed] pt-4"><span className="flex items-center gap-2 px-2 text-[10px] font-semibold text-[#6f7681]"><span className="size-5 rounded-full bg-[#d4e2ff]" /> arsen</span></div>
          </aside>
          <div className="min-w-0 flex-1 p-4 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[10px] font-semibold text-[#7d8490]"><span className="size-1.5 rounded-full bg-[#38ad76]" /> Workspace overview</div><h3 className="mt-2 text-[24px] font-bold tracking-[-0.06em] text-[#171a20] sm:text-[32px]">Your project pulse</h3></div><span className="hidden rounded-full border border-[#dfe3ea] bg-white px-3 py-2 text-[10px] font-semibold text-[#747b86] sm:block">Last 14 days <ChevronDown className="ml-3 inline size-3" /></span></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#e1e5eb] bg-white p-4"><div className="flex items-center justify-between text-[10px] font-semibold text-[#7a818d]"><span>Open feedback</span><span className="rounded-full bg-[#e8f7ef] px-2 py-1 text-[#2da16d]">↓ 18%</span></div><strong className="mt-4 block text-[28px] tracking-[-0.06em] text-[#1a1d23]">24</strong><div className="mt-3 flex h-9 items-end gap-1">{chartBars.slice(0, 14).map((height, index) => <span key={index} className="flex-1 rounded-t bg-[#76a8fa]" style={{ height: `${height}%` }} />)}</div></div><div className="rounded-2xl border border-[#e1e5eb] bg-white p-4"><div className="flex items-center justify-between text-[10px] font-semibold text-[#7a818d]"><span>Resolved this week</span><span className="rounded-full bg-[#fff0e9] px-2 py-1 text-[#d98458]">+ 12%</span></div><strong className="mt-4 block text-[28px] tracking-[-0.06em] text-[#1a1d23]">68</strong><div className="mt-3 flex h-9 items-end gap-1">{chartBars.slice(6, 20).map((height, index) => <span key={index} className="flex-1 rounded-t bg-[#f2ad80]" style={{ height: `${height}%` }} />)}</div></div></div>
            <div className="mt-4 rounded-2xl border border-[#e1e5eb] bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><div><h4 className="text-[13px] font-bold text-[#20242b]">Project review activity</h4><p className="mt-1 text-[10px] text-[#8b919c]">See where every project stands before the next client message.</p></div><span className="hidden rounded-full bg-[#f1f3f6] px-2.5 py-1 text-[10px] font-semibold text-[#777f8b] sm:block">All projects <ChevronDown className="ml-2 inline size-3" /></span></div><div className="mt-5 overflow-hidden rounded-xl border border-[#edf0f3]"><div className="grid grid-cols-[1.25fr_0.7fr_0.7fr] border-b border-[#edf0f3] bg-[#fafbfc] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#9ba1ab] sm:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr]"><span>Project</span><span>Status</span><span>Items</span><span className="hidden sm:block">Updated</span></div>{[["Acme homepage", "Review ready", "8", "Today"], ["Northstar launch", "In progress", "3", "Yesterday"], ["Studio refresh", "Approved", "12", "Oct 4"]].map(([name, status, items, updated]) => <div key={name} className="grid grid-cols-[1.25fr_0.7fr_0.7fr] items-center border-b border-[#f0f2f5] px-3 py-3 text-[10px] last:border-0 sm:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr]"><span className="font-bold text-[#30343c]">{name}</span><span><span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${status === "Approved" ? "bg-[#e8f7ef] text-[#2b9d6b]" : status === "Review ready" ? "bg-[#eaf2ff] text-[#4e85e4]" : "bg-[#fff2e8] text-[#ce824f]"}`}>{status}</span></span><span className="text-[#69717d]">{items}</span><span className="hidden text-[#8d949e] sm:block">{updated}</span></div>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelinePreview() {
  const items = [
    ["10:14", "Client comment", "Hero spacing needs another pass", "blue"],
    ["11:02", "Team reply", "Updated the desktop and mobile layouts", "purple"],
    ["12:38", "Feedback resolved", "Maya marked the comment as resolved", "green"],
    ["13:10", "Review requested", "Round 2 is ready for the client", "orange"],
  ] as const;

  return <div className="relative overflow-hidden rounded-[26px] border border-[#e0e4ec] bg-[#f8f9fb] p-4 shadow-[0_20px_50px_rgba(45,54,70,0.08)] sm:p-6"><div className="mb-4 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#89919e]">Acme homepage</span><h3 className="mt-1 text-[17px] font-bold tracking-[-0.04em] text-[#252931]">Review timeline</h3></div><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#7c8490]">Round 2</span></div><div className="rounded-2xl border border-[#e4e8ee] bg-white p-4 sm:p-5">{items.map(([time, label, copy, color], index) => <div key={label} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex w-10 shrink-0 flex-col items-center"><span className={`relative z-10 mt-0.5 size-2.5 rounded-full ${color === "blue" ? "bg-[#5791ef]" : color === "purple" ? "bg-[#a479e8]" : color === "green" ? "bg-[#3db57c]" : "bg-[#e39a63]"}`} />{index < items.length - 1 ? <span className="absolute top-3 h-full w-px bg-[#e6e9ef]" /> : null}</div><div className="flex min-w-0 flex-1 items-start justify-between gap-3"><div><p className="text-[11px] font-bold text-[#343942]">{label}</p><p className="mt-1 text-[11px] leading-[1.45] text-[#7d8490]">{copy}</p></div><span className="shrink-0 text-[10px] font-semibold text-[#a0a6b0]">{time}</span></div></div>)}</div></div>;
}

function ApprovalPreview() {
  return <div className="rounded-[26px] border border-[#e1e5eb] bg-white p-5 shadow-[0_20px_50px_rgba(45,54,70,0.07)] sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a929e]">Client portal</p><h3 className="mt-2 text-[20px] font-bold tracking-[-0.05em] text-[#23272f]">Northstar launch</h3></div><span className="flex items-center gap-1.5 rounded-full bg-[#e8f7ef] px-2.5 py-1 text-[10px] font-bold text-[#2da16d]"><ShieldCheck className="size-3" /> Secure link</span></div><div className="mt-6 rounded-2xl bg-[#f6f8fb] p-4"><div className="flex items-center justify-between text-[10px] font-semibold text-[#78808c]"><span>Review progress</span><span className="text-[#313640]">6 of 6 resolved</span></div><div className="mt-3 flex gap-1.5">{Array.from({ length: 6 }).map((_, index) => <span key={index} className="h-2 flex-1 rounded-full bg-[#58c28d]" />)}</div><div className="mt-5 rounded-xl border border-[#e3e7ed] bg-white p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-[#353a43]"><span className="flex size-5 items-center justify-center rounded-full bg-[#d8c6ff] text-[9px] text-[#5b427e]">A</span> arsen</div><p className="mt-2 text-[12px] font-semibold text-[#3a3f48]">Everything looks good. Ready for approval.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button className="rounded-full border border-[#d9dee7] px-3 py-2.5 text-[11px] font-bold text-[#555d69]" type="button">Request changes</button><button className="rounded-full bg-[#111216] px-3 py-2.5 text-[11px] font-bold text-white" type="button">Approve project</button></div></div>;
}

export default function ProductPage() {
  const [openFaq, setOpenFaq] = useState(1);

  return (
    <main className="overflow-hidden bg-white text-[#111216]">
      <MarketingHeader />

      <section className="px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-10">
        <div className="mx-auto max-w-[920px] text-center">
          <span className="inline-flex rounded-full bg-[#eaf3ff] px-3.5 py-2 text-[12px] font-bold text-[#4d87df]">Reviewly workspace</span>
          <h1 className="mx-auto mt-7 max-w-[760px] text-[48px] font-bold leading-[0.98] tracking-[-0.08em] sm:text-[72px] lg:text-[84px]">How is your project<br />doing in review?</h1>
          <p className="mx-auto mt-7 max-w-[650px] text-[17px] leading-[1.55] text-[#657080] sm:text-[20px]">Visual feedback built for web teams. See what your clients actually mean, down to the page and element, then move every comment toward a confident approval.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link className="inline-flex items-center gap-2 rounded-full bg-[#111216] px-5 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(17,18,22,0.14)] transition-transform hover:-translate-y-0.5" href="/sign-up">Get started <ArrowRight className="size-4" /></Link><a className="inline-flex items-center gap-2 rounded-full bg-[#f0f1f4] px-5 py-3 text-[14px] font-bold text-[#22252b] transition-colors hover:bg-[#e7e8ec]" href="#workflow">Talk to our team</a></div>
          <div className="mt-6"><InstallSnippet /></div>
        </div>
        <div className="mx-auto mt-16 max-w-[1220px] sm:mt-20"><DashboardPreview /></div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[760px] text-center"><h2 className="text-[38px] font-bold leading-[1.03] tracking-[-0.07em] sm:text-[54px]">Feedback that knows<br />where it belongs.</h2><p className="mt-6 text-[16px] leading-[1.6] text-[#68717f]">Collect the detail, keep the conversation close, and make the next review round easier to understand.</p></div><div className="mx-auto mt-14 grid max-w-[1100px] gap-3 sm:grid-cols-2 lg:grid-cols-4">{featureCards.map((card) => { const Icon = card.icon; return <article key={card.title} className="min-h-[235px] rounded-[18px] border border-[#dfe3ea] bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(44,51,64,0.08)]"><Icon className="size-6 text-[#69717d]" strokeWidth={1.7} /><h3 className="mt-12 text-[17px] font-bold leading-[1.15] tracking-[-0.04em] text-[#22262e]">{card.title}</h3><p className="mt-3 text-[13px] leading-[1.55] text-[#737b87]">{card.description}</p></article>; })}</div></section>

      <section id="workflow" className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10"><div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"><div><h2 className="text-[34px] font-bold leading-[1.05] tracking-[-0.07em] sm:text-[48px]">Resolve feedback<br />without the chase.</h2><p className="mt-6 max-w-[430px] text-[16px] leading-[1.6] text-[#68717f]">Follow a request from the first client note to the moment it is ready for approval. Every step stays visible to the people doing the work.</p><Link className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#111216] underline decoration-[#cdd2dc] underline-offset-4 hover:decoration-[#111216]" href="/sign-up">See the workflow <ArrowRight className="size-4" /></Link></div><TimelinePreview /></div></section>

      <section className="bg-[#fafbfc] px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24"><div className="order-2 lg:order-1"><ApprovalPreview /></div><div className="order-1 lg:order-2"><h2 className="text-[34px] font-bold leading-[1.05] tracking-[-0.07em] sm:text-[48px]">Give the client<br />a clear yes.</h2><p className="mt-6 max-w-[430px] text-[16px] leading-[1.6] text-[#68717f]">Share one secure link when the project is ready. Clients can review the whole project, add a final comment, approve the round, or request changes without a new account.</p><div className="mt-7 flex flex-col gap-3 text-[13px] font-semibold text-[#4c5562]"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#3aa873]" /> Project-scoped and revocable review links</span><span className="flex items-center gap-2"><CircleCheck className="size-4 text-[#3aa873]" /> Approval rounds stay separate from feedback status</span><span className="flex items-center gap-2"><Users className="size-4 text-[#3aa873]" /> Anonymous client access, no account required</span></div></div></div></section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[1120px] overflow-hidden rounded-[26px] border border-[#e3e6ec] bg-[#f7f8fa] p-5 sm:p-10"><div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]"><div><div className="flex size-11 items-center justify-center rounded-2xl bg-[#e6efff] text-[#4d87e8]"><Sparkles className="size-5" /></div><h2 className="mt-8 text-[33px] font-bold leading-[1.04] tracking-[-0.07em] sm:text-[48px]">Reviewly: ship with confidence.</h2><p className="mt-5 max-w-[420px] text-[16px] leading-[1.6] text-[#6d7582]">A focused review system for teams who would rather spend their time improving the work than translating feedback.</p><Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#111216] px-5 py-3 text-[14px] font-bold text-white" href="/sign-up">Create a project <ArrowRight className="size-4" /></Link></div><div className="relative min-h-[260px] overflow-hidden rounded-[22px] bg-[#15171c] p-5 text-white sm:min-h-[320px] sm:p-8"><div className="absolute right-[-40px] top-[-50px] size-60 rounded-full border border-[#363b45]" /><div className="absolute bottom-[-80px] left-[-30px] size-64 rounded-full border border-[#2d323b]" /><div className="relative z-10 flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[12px] font-bold"><span className="flex size-7 items-center justify-center rounded-xl bg-white text-[#15171c]">R</span> Product review</span><span className="rounded-full bg-[#263d32] px-2.5 py-1 text-[10px] font-bold text-[#70d19c]">Ready</span></div><div><button className="flex size-12 items-center justify-center rounded-full bg-white text-[#15171c] transition-transform hover:scale-105" type="button" aria-label="Play product overview"><Play className="ml-0.5 size-5 fill-current" /></button><p className="mt-5 max-w-[260px] text-[18px] font-bold leading-[1.15] tracking-[-0.04em]">See the review loop in action.</p></div></div></div></div></div></section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[760px] text-center"><h2 className="text-[38px] font-bold tracking-[-0.07em] sm:text-[54px]">Frequently asked questions</h2><p className="mt-5 text-[16px] leading-[1.6] text-[#68717f]">Have more questions or need help getting started? <Link className="underline decoration-[#cdd2dc] underline-offset-4 hover:decoration-[#111216]" href="/sign-up">Start a project</Link> and see the workflow for yourself.</p></div><div className="mx-auto mt-12 max-w-[720px]">{faqs.map((faq, index) => { const isOpen = openFaq === index; return <div key={faq.question} className={`border-b border-[#e3e6eb] ${isOpen ? "rounded-2xl border-x border-t bg-[#fafbfc] px-5" : "px-5"}`}><button className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-bold text-[#20242b]" type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)}><span>{faq.question}</span>{isOpen ? <ChevronDown className="size-4 rotate-180 text-[#707884]" /> : <ChevronDown className="size-4 text-[#707884]" />}</button>{isOpen ? <p className="max-w-[620px] pb-6 text-[14px] leading-[1.7] text-[#6d7582]">{faq.answer}</p> : null}</div>; })}</div></section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10"><div className="mx-auto max-w-[1120px] rounded-[28px] bg-[#17191d] px-6 py-16 text-center text-white sm:px-10 sm:py-24"><h2 className="text-[40px] font-bold leading-[1.03] tracking-[-0.08em] sm:text-[64px]">Make the next review<br />your easiest one.</h2><p className="mx-auto mt-6 max-w-[480px] text-[16px] leading-[1.6] text-[#a8afba]">One install. Real context. A clear path from comment to approval.</p><div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Link className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold text-[#111216]" href="/sign-up">Get started <ArrowRight className="size-4" /></Link><Link className="inline-flex items-center gap-2 rounded-full bg-[#2a2d33] px-5 py-3 text-[14px] font-bold text-white" href="/#product">Back to product overview</Link></div></div></section>

      <footer className="border-t border-[#eceef2] px-5 py-10 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1120px] flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"><div><Link href="/"><ProductMark /></Link><p className="mt-4 max-w-[240px] text-[13px] leading-[1.5] text-[#7b828e]">Visual feedback and client approval for teams that care about the details.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 text-[13px] sm:grid-cols-3"><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Product</span><Link className="text-[#747b87] hover:text-[#111216]" href="/product">Overview</Link><Link className="text-[#747b87] hover:text-[#111216]" href="/#workflow">Workflow</Link></div><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Resources</span><Link className="text-[#747b87] hover:text-[#111216]" href="/sign-up">Get started</Link><a className="text-[#747b87] hover:text-[#111216]" href="https://github.com/arionel07/reviewly" target="_blank" rel="noreferrer">GitHub</a></div><div className="flex flex-col gap-3"><span className="font-bold text-[#111216]">Account</span><Link className="text-[#747b87] hover:text-[#111216]" href="/sign-in">Log in</Link><Link className="text-[#747b87] hover:text-[#111216]" href="/dashboard">Dashboard</Link></div></div></div><div className="mx-auto mt-10 flex max-w-[1120px] flex-col gap-3 border-t border-[#eceef2] pt-5 text-[11px] text-[#8b919c] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Reviewly. Built for better reviews.</span><span className="flex items-center gap-2"><Send className="size-3.5" /> Make every comment count.</span></div></footer>
    </main>
  );
}
