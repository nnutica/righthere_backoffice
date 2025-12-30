import * as React from "react";
import { cn } from "@/libs/utils";

type AlertVariant = "default" | "danger";

const variantClasses: Record<AlertVariant, string> = {
  default: "border-[var(--hud-panel-border)] bg-[var(--hud-panel-strong)] text-slate-100",
  danger: "border-[rgba(255,107,107,0.6)] bg-[rgba(255,107,107,0.12)] text-[var(--hud-danger)]",
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 font-semibold", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-(--hud-muted)", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

