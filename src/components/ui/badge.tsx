import * as React from "react";
import { cn } from "@/libs/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--hud-panel-strong)] text-slate-100",
  success: "bg-[rgba(114,242,193,0.2)] text-[var(--hud-success)]",
  warning: "bg-[rgba(255,209,102,0.2)] text-[var(--hud-warning)]",
  danger: "bg-[rgba(255,107,107,0.2)] text-[var(--hud-danger)]",
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

