import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "border-zinc-700 bg-zinc-800 text-zinc-300": variant === "default",
          "border-zinc-600 bg-zinc-700 text-zinc-200": variant === "secondary",
          "border-emerald-800 bg-emerald-950 text-emerald-400":
            variant === "success",
          "border-yellow-800 bg-yellow-950 text-yellow-400":
            variant === "warning",
          "border-red-800 bg-red-950 text-red-400": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
