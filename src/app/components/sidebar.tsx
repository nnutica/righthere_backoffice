"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/libs/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/diaries", label: "Diaries", icon: BookOpen },
  { href: "/users", label: "Users", icon: Users },
  { href: "/community-guard", label: "Community Guard", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-(--hud-panel-border) bg-(--hud-panel) px-6 py-8 shadow-(--hud-shadow) lg:flex">
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-center">
          <img
            src="/righthere.png"
            alt="Right Here"
            width={200}
            height={300}
            className="h-auto w-40"   
          />
        </div>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-(--hud-accent)">
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
                  ? "border-(--hud-accent) bg-(--hud-accent-soft) text-(--hud-accent)"
                  : "text-slate-200 hover:border-(--hud-panel-border) hover:bg-(--hud-panel-strong)"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border border-(--hud-panel-border) bg-(--hud-panel-strong) transition",
                  active && "border-(--hud-accent) text-(--hud-accent)"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}

