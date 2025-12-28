"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Users,
  Trophy,
  Shield,
} from "lucide-react";
import { cn } from "@/libs/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/diaries", label: "Diaries", icon: BookOpen },
  { href: "/users", label: "Users", icon: Users },
  { href: "/quests", label: "Quests", icon: Trophy },
  { href: "/community-guard", label: "Community Guard", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-[var(--hud-panel-border)] bg-[var(--hud-panel)] px-6 py-8 shadow-[var(--hud-shadow)] lg:flex">
      <div className="mb-10">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-[var(--hud-accent)]">
          RightHere
        </p>
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Control HUD
        </h1>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold transition",
                active
                  ? "border-[var(--hud-accent)] bg-[var(--hud-accent-soft)] text-[var(--hud-accent)]"
                  : "text-slate-200 hover:border-[var(--hud-panel-border)] hover:bg-[var(--hud-panel-strong)]"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] transition",
                  active && "border-[var(--hud-accent)] text-[var(--hud-accent)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] p-4 text-xs text-[var(--hud-muted)]">
        Live ops ready. All pages guarded by Firebase auth.
      </div>
    </aside>
  );
}

