"use client";

import { Bell, LogOut, Search, UserCircle } from "lucide-react";
import { auth } from "@/libs/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  email: string;
}

export default function Topbar({ email }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-(--hud-panel-border) bg-[rgba(7,11,22,0.85)] backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-(--hud-muted)" />
          <Input
            placeholder="Search signals, users, quests..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Signed in</DropdownMenuLabel>
              <DropdownMenuItem className="text-sm text-[var(--hud-muted)]">
                {email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => auth.signOut()}
                className="text-[var(--hud-danger)]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


