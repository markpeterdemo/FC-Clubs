"use client"

import { cn } from "@/lib/utils"

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl bg-gradient-to-br from-accent-green to-emerald-600 flex items-center justify-center font-black text-black shadow-lg shadow-accent-green/30",
          size === "sm" && "w-7 h-7 text-xs",
          size === "md" && "w-8 h-8 text-sm",
          size === "lg" && "w-10 h-10 text-base",
        )}
      >
        MD
      </div>
      <span
        className={cn(
          "font-black tracking-tight",
          "bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-xl",
        )}
      >
        Matchday
      </span>
    </div>
  )
}
