"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg bg-bg-card border border-white/10 rounded-2xl p-6 shadow-2xl",
          "animate-fade-in-scale",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-bold text-white mb-1", className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-text-muted mb-4", className)}>{children}</p>
}
