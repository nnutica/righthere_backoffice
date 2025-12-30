import * as React from "react";
import { cn } from "@/libs/utils";

interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
}

function Tooltip({ label, className, children, ...props }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)} {...props}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-md border border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] px-2 py-1 text-xs text-slate-100 opacity-0 shadow-[var(--hud-shadow)] transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}

export { Tooltip };
