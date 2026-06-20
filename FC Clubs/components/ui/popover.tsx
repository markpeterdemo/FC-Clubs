"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect, type ReactNode } from "react"

interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  align?: "start" | "center" | "end"
  side?: "bottom" | "top"
  className?: string
}

export function Popover({ trigger, children, align = "center", side = "bottom", className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-2 min-w-[200px] bg-bg-elevated border border-white/10 rounded-xl p-2 shadow-2xl",
              align === "start" && "left-0",
              align === "center" && "left-1/2 -translate-x-1/2",
              align === "end" && "right-0",
              side === "top" && "bottom-full mb-2 mt-0",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PopoverItem({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors",
        className
      )}
    >
      {children}
    </button>
  )
}
