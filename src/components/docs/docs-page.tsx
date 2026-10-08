"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Code2,
  Command,
  Database,
  FileCode2,
  GitFork,
  KeyRound,
  Link2,
  Menu,
  MessageSquareText,
  PanelLeftOpen,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navigationGroups = [
  {
    title: "Get started",
    icon: Rocket,
    items: ["Create a project", "Add the widget", "Start collecting feedback", "Request approval", "Next steps"],
  },
  {
    title: "Product",
    icon: Sparkles,
    items: ["Overview", "Feedback", "Review links", "Approval rounds"],
  },
  {
    title: "Develop",
    icon: Code2,
    items: ["Widget installation", "Project keys", "Screenshots and R2", "Testing locally"],
  },
] as const;

const quickLinks = [
  { title: "Create a project", description: "Set up a workspace and connect the first website.", icon: FileCode2, href: "/sign-up" },
  { title: "Add the widget", description: "Install the small script that lets clients point at the work.", icon: Code2, href: "#widget" },
  { title: "Start a review", description: "Share a secure link and collect the first round of feedback.", icon: MessageSquareText, href: "#getting-started" },
  { title: "Request approval", description: "Move resolved feedback into a clear client decision.", icon: CheckCircle2, href: "#approval" },
] as const;

function DocsBrand() {
  return (
    <Link className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.05em] text-[#111216]" href="/">
      <span className="relative flex size-7 items-center justify-center rounded-[9px] bg-[#111216] text-white">
        <span className="text-[14px] font-black tracking-[-0.08em]">R</span>
      </span>
      Reviewly
    </Link>
  );
}

function CodeBlock({ command, label = "Terminal" }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[20px] bg-[#111216] text-white shadow-[0_12px_28px_rgba(17,18,22,0.15)]">
      <div className="flex items-center justify-between border-b border-[#2c2f36] px-4 py-3 text-[12px] font-bold"><span className="flex items-center gap-2"><Command className="size-3.5 text-[#9da4b1]" /> {label}</span><button className="flex items-center gap-1.5 text-[11px] text-[#c0c5cf] hover:text-white" type="button" onClick={copyCommand}>{copied ? <Check className="size-3.5 text-[#5ed093]" /> : <Link2 className="size-3.5" />} {copied ? "Copied" : "Copy"}</button></div>
      <div className="overflow-x-auto px-4 py-5 font-mono text-[12px] text-[#f1a8dc] sm:text-[13px]"><span className="mr-2 text-[#717987]">$</span>{command}</div>
    </div>
  );
}

function DocsSidebar({ collapsed, mobileOpen, onCollapse, onClose }: { collapsed: boolean; mobileOpen: boolean; onCollapse: () => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-[#dce0e7] bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[78px]" : ""}`}>
      <div className={`flex h-[70px] shrink-0 items-center border-b border-[#eceef2] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {collapsed ? <button className="flex size-9 items-center justify-center rounded-xl text-[#68717d] hover:bg-[#f1f2f5]" type="button" onClick={onCollapse} aria-label="Expand documentation sidebar"><PanelLeftOpen className="size-4" /></button> : <><DocsBrand /><button className="flex size-9 items-center justify-center rounded-xl text-[#68717d] hover:bg-[#f1f2f5] lg:hidden" type="button" onClick={onClose} aria-label="Close documentation navigation"><X className="size-4" /></button></>}
      </div>
      <div className={`overflow-y-auto px-4 py-4 ${collapsed ? "lg:px-3" : ""}`}>
        {!collapsed ? <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7e8794]" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-full border border-[#d9dde5] bg-white pl-9 pr-20 text-[13px] text-[#303640] outline-none placeholder:text-[#7f8794] focus:border-[#88baf2] focus:ring-2 focus:ring-[#ddecff]" placeholder="Search or Ask AI" aria-label="Search documentation" /><span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] font-bold text-[#9aa0aa]"><kbd className="rounded border border-[#d9dde5] px-1.5 py-1">⌘</kbd><kbd className="rounded border border-[#d9dde5] px-1.5 py-1">K</kbd></span></div> : null}
        <nav className={`mt-4 flex flex-col gap-1 ${collapsed ? "lg:mt-3" : ""}`} aria-label="Documentation navigation">
          {[{ label: "Home", icon: BookOpen }, { label: "Guides", icon: FileCode2 }, { label: "FAQ", icon: MessageSquareText }, { label: "Reference", icon: Database }, { label: "Learn", icon: Sparkles }].map(({ label, icon: Icon }) => <a key={label} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#596270] transition-colors hover:bg-[#f1f2f5] hover:text-[#111216] ${label === "Home" ? "bg-[#e4e5e9] text-[#111216]" : ""} ${collapsed ? "lg:justify-center lg:px-0" : ""}`} href={label === "Home" ? "#top" : `#${label.toLowerCase()}`} onClick={onClose} title={collapsed ? label : undefined}><Icon className="size-4 shrink-0 text-[#858d9a]" />{!collapsed ? <span>{label}</span> : null}</a>)}
          {!collapsed ? navigationGroups.map((group) => { const GroupIcon = group.icon; return <div key={group.title} className="mt-6"><div className="flex items-center gap-2 px-2.5 text-[13px] font-bold text-[#1c2027]"><GroupIcon className="size-4 text-[#68717d]" />{group.title}</div><div className="mt-2 flex flex-col gap-1">{group.items.filter((item) => !normalizedQuery || item.toLowerCase().includes(normalizedQuery)).map((item) => <a key={item} className="rounded-lg px-2.5 py-1.5 text-[13px] text-[#68717d] transition-colors hover:bg-[#f5f6f8] hover:text-[#111216]" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={onClose}>{item}</a>)}</div></div>; }) : null}
        </nav>
      </div>
      <button className={`absolute -right-[19px] bottom-5 hidden size-10 items-center justify-center rounded-full border border-[#dce0e7] bg-white text-[#7d8591] shadow-[0_3px_10px_rgba(30,40,55,0.08)] hover:text-[#111216] lg:flex ${collapsed ? "lg:hidden" : ""}`} type="button" onClick={onCollapse} aria-label="Collapse documentation sidebar"><ChevronLeft className="size-4" /></button>
    </aside>
  );
}

export function DocsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
      <main id="top" className="min-h-svh bg-white text-[#111216]">
      <DocsSidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} onCollapse={() => setSidebarCollapsed((value) => !value)} onClose={() => setMobileOpen(false)} />
      <div className={`min-h-svh transition-[margin] duration-200 ${sidebarCollapsed ? "lg:ml-[78px]" : "lg:ml-[278px]"}`}>
        <div className="flex h-[70px] items-center justify-between border-b border-[#eceef2] px-5 lg:hidden"><DocsBrand /><button className="flex size-9 items-center justify-center rounded-xl border border-[#dce0e7] text-[#68717d]" type="button" onClick={() => setMobileOpen(true)} aria-label="Open documentation navigation"><Menu className="size-4" /></button></div>
        <div className="mx-auto max-w-[1100px] px-5 pb-20 pt-10 sm:px-8 sm:pt-12 lg:px-10 lg:pt-14">
          <header className="max-w-[760px]"><p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#8b929e]">Reviewly docs</p><h1 className="mt-4 text-[40px] font-bold leading-[1.02] tracking-[-0.07em] sm:text-[56px]">Make every review<br />feel effortless.</h1><p className="mt-5 max-w-[650px] text-[16px] leading-[1.6] text-[#646d7a]">Collect feedback in context, keep your team aligned, and move client work from first comment to final approval.</p></header>

          <section id="overview" className="mt-10 grid gap-4 lg:grid-cols-2" aria-label="Quick start">
            <article className="overflow-hidden rounded-[20px] border border-[#dfe3ea] bg-[#fbfbfd] p-5 sm:p-6"><div className="flex items-center gap-2 text-[17px] font-bold"><Sparkles className="size-5 text-[#f2ad00]" /> Quick start</div><p className="mt-3 text-[13px] leading-[1.55] text-[#737b87]">Create your first project, then connect a website with the Reviewly widget.</p><div className="mt-5"><CodeBlock command="create a Reviewly project" /></div><p className="mt-4 text-[12px] text-[#727a87]">Then continue with <a className="font-semibold text-[#087ee8] hover:underline" href="#getting-started">setting up your environment</a>.</p></article>
            <article id="feedback" className="relative scroll-mt-8 overflow-hidden rounded-[20px] border border-[#add7ff] bg-[#eaf5ff] p-5 sm:p-6"><div className="relative z-10"><h2 className="max-w-[300px] text-[19px] font-bold leading-[1.2] text-[#173f70]">Collect visual feedback from any website</h2><p className="mt-3 max-w-[330px] text-[13px] leading-[1.55] text-[#507297]">Give clients a simple way to point at the exact page element they want you to change.</p><a className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#168ff0] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_7px_15px_rgba(22,143,240,0.18)]" href="#widget">Start the widget guide <ArrowRight className="size-3.5" /></a></div><div className="pointer-events-none absolute -bottom-11 right-2 flex rotate-[-7deg] gap-2 opacity-75"><span className="h-32 w-20 rounded-[13px] border-4 border-[#2169a7] bg-[#f7fbff] shadow-lg" /><span className="h-40 w-24 rounded-[15px] border-4 border-[#2169a7] bg-[#d4ebff] shadow-lg" /><span className="mt-5 h-28 w-20 rounded-[13px] border-4 border-[#2169a7] bg-[#f7fbff] shadow-lg" /></div></article>
            <article className="relative overflow-hidden rounded-[20px] border border-[#cbdcff] bg-[#edf5ff] p-5 sm:col-span-2 sm:p-6"><div className="relative z-10 max-w-[450px]"><div className="flex size-10 items-center justify-center rounded-xl bg-[#6d5ae6] text-white shadow-[0_8px_18px_rgba(109,90,230,0.22)]"><ShieldCheck className="size-5" /></div><h2 className="mt-4 text-[19px] font-bold text-[#1b2c49]">Keep feedback connected to the work</h2><p className="mt-3 text-[13px] leading-[1.6] text-[#53657e]">Every comment includes the URL, selector, screenshot, and browser context. Resolve the details without asking the client to explain them twice.</p><a className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-[#252a34] shadow-[0_5px_12px_rgba(38,63,99,0.08)]" href="#feedback">Explore feedback <ArrowUpRight className="size-3.5" /></a></div><div className="pointer-events-none absolute -bottom-8 right-6 hidden w-[360px] rotate-[-7deg] rounded-[20px] border border-white bg-[#d7e8fb] p-4 opacity-80 shadow-[0_20px_36px_rgba(52,94,147,0.12)] sm:block"><div className="h-2 w-24 rounded-full bg-[#9ec5ef]" /><div className="mt-3 h-2 w-full rounded-full bg-white/80" /><div className="mt-2 h-2 w-3/4 rounded-full bg-white/80" /><div className="mt-5 flex gap-2"><span className="h-16 flex-1 rounded-lg bg-white/80" /><span className="h-16 flex-1 rounded-lg bg-white/60" /><span className="h-16 flex-1 rounded-lg bg-white/80" /></div></div></article>
            <article id="approval" className="relative scroll-mt-8 overflow-hidden rounded-[20px] border border-[#b9e5ce] bg-[#effbf4] p-5 sm:p-6"><div className="relative z-10 max-w-[370px]"><div className="flex size-10 items-center justify-center rounded-xl bg-[#2a9b69] text-white shadow-[0_8px_18px_rgba(42,155,105,0.18)]"><CheckCircle2 className="size-5" /></div><h2 className="mt-4 text-[19px] font-bold text-[#1b4432]">Get a clear client approval</h2><p className="mt-3 text-[13px] leading-[1.55] text-[#557968]">Request a review when the open feedback is resolved and let the client approve or request changes.</p><a className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#22935f] px-4 py-2.5 text-[12px] font-bold text-white" href="#approval">Read the approval guide <ArrowRight className="size-3.5" /></a></div><div className="pointer-events-none absolute -bottom-5 right-4 hidden w-44 rotate-[8deg] rounded-xl border border-[#c5ead6] bg-white p-3 shadow-[0_12px_30px_rgba(42,113,80,0.12)] sm:block"><div className="flex items-center gap-2 text-[10px] font-bold text-[#2b8b5c]"><CheckCircle2 className="size-3" /> Approved</div><div className="mt-3 h-2 w-full rounded-full bg-[#d9f1e2]" /><div className="mt-2 h-2 w-2/3 rounded-full bg-[#edf7f0]" /></div></article>
          </section>

          <section id="getting-started" className="mt-20 scroll-mt-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-[22px] font-bold tracking-[-0.04em]">Start with the workflow</h2><p className="mt-2 text-[14px] text-[#707884]">The shortest path from an empty workspace to a client-ready review.</p></div><a className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#087ee8] hover:underline" href="#reference">Browse the reference <ArrowUpRight className="size-3.5" /></a></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{quickLinks.map((item) => { const Icon = item.icon; return <a key={item.title} className="group rounded-[18px] border border-[#dfe3ea] bg-white p-5 transition-transform hover:-translate-y-0.5 hover:border-[#c8ced8] hover:shadow-[0_13px_28px_rgba(32,40,53,0.06)]" href={item.href}><div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-[#f0f2f5] text-[#657080] group-hover:bg-[#eaf3ff] group-hover:text-[#168ff0]"><Icon className="size-4" /></span><ArrowUpRight className="size-4 text-[#a3a9b2] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><h3 className="mt-7 text-[15px] font-bold text-[#242932]">{item.title}</h3><p className="mt-2 text-[13px] leading-[1.55] text-[#747c88]">{item.description}</p></a>; })}</div></section>

          <section id="widget" className="mt-20 scroll-mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><div className="rounded-[20px] border border-[#dfe3ea] bg-[#fbfbfd] p-6 sm:p-8"><div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a929e]"><Code2 className="size-4" /> Widget installation</div><h2 className="mt-4 text-[27px] font-bold tracking-[-0.06em]">Add context to every comment.</h2><p className="mt-3 max-w-[520px] text-[14px] leading-[1.6] text-[#6f7784]">Place the widget before the closing body tag on the site you are reviewing. Clients can then select an element and leave feedback without leaving the page.</p><div className="mt-6"><CodeBlock command={'<script src="/widget/widget.js" data-project-key="..."></script>'} label="HTML" /></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-[#69727f]"><span className="flex items-center gap-1.5"><KeyRound className="size-3.5 text-[#168ff0]" /> Public project key only</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#2a9b69]" /> Admin data stays private</span></div></div><div className="rounded-[20px] border border-[#dfe3ea] bg-[#f6f8fb] p-6 sm:p-8"><div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#657080] shadow-[0_5px_12px_rgba(38,45,57,0.06)]"><Settings2 className="size-5" /></div><h2 className="mt-5 text-[20px] font-bold tracking-[-0.04em]">Local setup</h2><p className="mt-3 text-[13px] leading-[1.6] text-[#707884]">Use a local database and a Reviewly project key to test the complete feedback loop before sharing the link.</p><div className="mt-6 flex flex-col gap-3 text-[12px] font-semibold text-[#596371]"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#2a9b69]" /> Start the Next.js app</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#2a9b69]" /> Open the widget playground</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#2a9b69]" /> Submit and resolve a test comment</span></div></div></section>

          <section id="reference" className="mt-20 grid gap-4 border-t border-[#eceef2] pt-10 sm:grid-cols-3"><a className="rounded-[16px] border border-[#e2e5ea] p-5 transition-colors hover:bg-[#fafbfc]" href="#feedback"><MessageSquareText className="size-5 text-[#6e7784]" /><h3 className="mt-5 text-[15px] font-bold">Feedback reference</h3><p className="mt-2 text-[13px] leading-[1.55] text-[#747c88]">Statuses, comments, screenshots, and context captured by the widget.</p></a><a className="rounded-[16px] border border-[#e2e5ea] p-5 transition-colors hover:bg-[#fafbfc]" href="#approval"><ShieldCheck className="size-5 text-[#6e7784]" /><h3 className="mt-5 text-[15px] font-bold">Review links</h3><p className="mt-2 text-[13px] leading-[1.55] text-[#747c88]">Project-scoped access tokens, expiration, and client portal behavior.</p></a><a className="rounded-[16px] border border-[#e2e5ea] p-5 transition-colors hover:bg-[#fafbfc]" href="https://github.com/arionel07/reviewly" target="_blank" rel="noreferrer"><GitFork className="size-5 text-[#6e7784]" /><h3 className="mt-5 text-[15px] font-bold">Open source</h3><p className="mt-2 text-[13px] leading-[1.55] text-[#747c88]">Read the implementation and follow the project on GitHub.</p></a></section>

          <footer className="mt-20 flex flex-col gap-3 border-t border-[#eceef2] pt-6 text-[12px] text-[#8b929e] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Reviewly documentation.</span><Link className="inline-flex items-center gap-1.5 font-semibold text-[#68717d] hover:text-[#111216]" href="/">Back to Reviewly <ArrowUpRight className="size-3.5" /></Link></footer>
        </div>
      </div>
    </main>
  );
}
