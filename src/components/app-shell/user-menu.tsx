"use client";

import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/client";

function getInitials(name: string) {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
}

export function UserMenu({
  user,
  compact = false,
}: {
  user: { name: string; email: string };
  compact?: boolean;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={compact
          ? "flex size-9 items-center justify-center rounded-full p-0 text-left outline-hidden hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          : "flex w-full items-center gap-2 rounded-full border border-transparent p-2 text-left text-sm outline-hidden hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"}
        aria-label="Open account menu"
      >
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        {!compact ? (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={compact ? "end" : "start"}
        side={compact ? "bottom" : "top"}
        sideOffset={compact ? 8 : 10}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="flex flex-col">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={isSigningOut}
            onClick={handleSignOut}
            variant="destructive"
          >
            <LogOut />
            <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
