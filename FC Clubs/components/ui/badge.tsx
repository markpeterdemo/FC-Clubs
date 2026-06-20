"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "rarity"
  rarity?: "common" | "rare" | "epic" | "legendary"
  className?: string
}

export function Badge({ children, variant = "default", rarity, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold",
        variant === "default" && "bg-white/10 text-text-secondary",
        variant === "outline" && "border border-white/10 text-text-secondary",
        variant === "success" && "bg-accent-green/10 text-accent-green border border-accent-green/20",
        variant === "warning" && "bg-accent-gold/10 text-accent-gold border border-accent-gold/20",
        variant === "danger" && "bg-accent-red/10 text-accent-red border border-accent-red/20",
        variant === "rarity" && {
          "text-rarity-common bg-white/5": rarity === "common",
          "text-rarity-rare bg-blue-500/10 border border-blue-500/20": rarity === "rare",
          "text-rarity-epic bg-purple-500/10 border border-purple-500/20": rarity === "epic",
          "text-rarity-legendary bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/10": rarity === "legendary",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
