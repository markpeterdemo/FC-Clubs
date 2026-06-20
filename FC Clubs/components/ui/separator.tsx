"use client"

import { cn } from "@/lib/utils"

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-white/5", className)} />
}
