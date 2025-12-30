import * as React from "react";
import { cn } from "@/libs/utils";

const Accordion = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  HTMLDetailsElement,
  React.DetailsHTMLAttributes<HTMLDetailsElement>
>(({ className, ...props }, ref) => (
  <details
    ref={ref}
    className={cn(
      "rounded-lg border border-(--hud-panel-border) bg-(--hud-panel-strong)",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLMapElement,
  React.HTMLAttributes<HTMLMapElement>
>(({ className, ...props }, ref) => (
  <summary
    ref={ref}
    className={cn(
      "flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-100",
      className
    )}
    {...props}
  />
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 pb-4 text-sm text-(--hud-muted)", className)} {...props} />
  )
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
