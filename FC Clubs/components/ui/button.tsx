"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glow"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200",
          "active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-accent-green focus-visible:outline-offset-2",
          {
            "bg-accent-green text-black hover:brightness-110 shadow-lg shadow-accent-green/20": variant === "primary",
            "glass-strong text-white hover:bg-white/10": variant === "secondary",
            "text-text-secondary hover:text-white hover:bg-white/5": variant === "ghost",
            "bg-accent-red text-white hover:brightness-110 shadow-lg shadow-accent-red/20": variant === "danger",
            "bg-gradient-to-br from-accent-green to-emerald-600 text-black font-bold shadow-lg shadow-accent-green/30 hover:shadow-accent-green/40 animate-pulse-glow": variant === "glow",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps }
