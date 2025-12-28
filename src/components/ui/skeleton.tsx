import * as React from "react";
import { cn } from "@/libs/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--hud-panel-strong)]", className)}
      {...props}
    />
  );
}

export { Skeleton };

