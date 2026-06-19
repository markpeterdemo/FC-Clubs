import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-surface-3 text-text-secondary": variant === "default",
          "bg-pitch-900/50 text-pitch-400": variant === "success",
          "bg-yellow-900/50 text-yellow-400": variant === "warning",
          "bg-red-900/50 text-red-400": variant === "danger",
          "bg-blue-900/50 text-blue-400": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
