"use client";

import {
  ArrowUpRight,
  BookOpen,
  Box,
  Command,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const destinations = [
  { label: "Dashboard", group: "Screens", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", group: "Screens", href: "/projects", icon: FolderKanban },
  { label: "Clients", group: "Screens", href: "/clients", icon: Users },
  { label: "Profile", group: "Screens", href: "/profile", icon: Settings },
];

const quickLinks = [
  { label: "Create a new project", href: "/projects/new", icon: FolderKanban },
  { label: "Add a new client", href: "/clients/new", icon: Users },
  { label: "Workspace settings", href: "/settings", icon: Settings },
];

const topics = ["Search", "Projects", "Clients", "Feedback", "Settings"];

const browseItems = [
  { label: "Trending", icon: Command },
  { label: "Screens", icon: LayoutDashboard },
  { label: "UI elements", icon: Box },
  { label: "Resources", icon: BookOpen },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredDestinations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return destinations;
    return destinations.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : close())}>
      <DialogTrigger
        aria-label="Open search"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
          />
        }
      >
        <Search />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[820px] gap-0 overflow-hidden rounded-[22px] border-[#4b4b4f] bg-[#343436] p-0 text-white shadow-[0_24px_70px_rgb(0_0_0_/_35%)] sm:max-w-[820px]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search Reviewly</DialogTitle>
          <DialogDescription>Search screens, projects, clients, and settings.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="size-5 shrink-0 text-white/55" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Web Apps, Screens, UI Elements, Flows or Keywords..."
            className="h-9 rounded-none border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-white/45 focus-visible:border-0 focus-visible:ring-0"
          />
          <DialogClose
            aria-label="Close search"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
              />
            }
          >
            <X />
          </DialogClose>
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant="ghost"
              size="sm"
              className="h-8 bg-white/10 px-3 text-xs text-white/85 hover:bg-white/20 hover:text-white"
              onClick={() => setQuery(topic === "Search" ? "" : topic)}
            >
              {topic === "Search" ? <Search data-icon="inline-start" /> : null}
              {topic}
            </Button>
          ))}
        </div>

        <div className="grid min-h-[390px] grid-cols-[190px_1fr] border-t border-white/10">
          <nav className="border-r border-white/10 p-4">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Browse
            </p>
            <div className="flex flex-col gap-1">
              {browseItems.map(({ label, icon: Icon }, index) => (
                <button
                  key={String(label)}
                  type="button"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${index === 0 ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
                  onClick={() => setQuery(index === 1 ? "" : String(label))}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex flex-col gap-6 overflow-y-auto p-5">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Screens</h2>
                <span className="text-xs text-white/40">{filteredDestinations.length} results</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {filteredDestinations.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="group flex min-h-24 flex-col justify-between rounded-xl bg-white/10 p-3 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="size-4 text-white/55 group-hover:text-white" />
                    <span className="flex items-center justify-between gap-2">
                      {label}
                      <ArrowUpRight className="size-3.5 text-white/40" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-white">Quick actions</h2>
              <div className="flex flex-wrap gap-2">
                {quickLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
