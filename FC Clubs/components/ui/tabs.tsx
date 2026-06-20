"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type ReactNode } from "react"

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  variant?: "pill" | "underline"
  className?: string
}

export function Tabs({ tabs, active, onChange, variant = "pill", className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1",
        variant === "pill" && "bg-white/5 rounded-xl p-1",
        variant === "underline" && "border-b border-white/5",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            active === tab.id
              ? variant === "pill"
                ? "bg-bg-elevated text-white shadow-sm"
                : "text-accent-green"
              : "text-text-muted hover:text-text-secondary",
            variant === "underline" && "rounded-none rounded-t-lg"
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              active === tab.id ? "bg-accent-green/20 text-accent-green" : "bg-white/10 text-text-muted"
            )}>
              {tab.count}
            </span>
          )}
          {active === tab.id && variant === "underline" && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  )
}
