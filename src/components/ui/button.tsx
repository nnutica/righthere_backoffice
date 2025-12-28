import * as React from "react";
import { cn } from "@/libs/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hud-accent)] disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--hud-accent)] text-slate-950 hover:bg-[var(--hud-accent-2)]",
  secondary: "bg-[var(--hud-panel-strong)] text-slate-100 hover:bg-slate-800",
  outline:
    "border border-[var(--hud-panel-border)] text-slate-100 hover:bg-[var(--hud-panel-strong)]",
  ghost: "text-slate-200 hover:bg-[var(--hud-panel-strong)]",
  destructive: "bg-[var(--hud-danger)] text-slate-950 hover:bg-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

