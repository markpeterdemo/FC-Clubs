import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "premium";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all duration-300",
        {
          "bg-surface-2/50 text-text-secondary border-border": variant === "default",
          "bg-pitch-900/30 text-pitch-400 border-pitch-800/30": variant === "success",
          "bg-yellow-900/30 text-yellow-400 border-yellow-800/30": variant === "warning",
          "bg-red-900/30 text-red-400 border-red-800/30": variant === "danger",
          "bg-blue-900/30 text-blue-400 border-blue-800/30": variant === "info",
          "bg-gradient-to-r from-pitch-600/20 to-pitch-500/20 text-pitch-400 border-pitch-500/30 shadow-sm shadow-pitch-500/10":
            variant === "premium",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
