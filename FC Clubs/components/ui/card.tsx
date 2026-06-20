"use client"

import { cn } from "@/lib/utils"
import type { ReactNode, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "gradient" | "player"
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
  glow?: boolean
}

export function Card({
  className,
  variant = "glass",
  padding = "md",
  hover = false,
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        variant === "default" && "bg-bg-card border-border",
        variant === "glass" && "glass",
        variant === "elevated" && "bg-bg-elevated border-border shadow-lg",
        variant === "gradient" && "bg-gradient-to-br from-accent-green/10 to-accent-blue/10 border-accent-green/10",
        variant === "player" && "bg-gradient-to-b from-bg-card to-bg-elevated border-border/20",
        hover && "card-glow-hover hover:bg-bg-card-hover cursor-pointer",
        glow && "card-glow",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-bold text-white", className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-text-muted mt-0.5", className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 mt-4 pt-3 border-t border-white/5", className)} {...props}>
      {children}
    </div>
  )
}
