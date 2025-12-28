import * as React from "react";
import { cn } from "@/libs/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hud-accent)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };

