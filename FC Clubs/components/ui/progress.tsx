"use client"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, size = "md", variant = "default", className, showLabel }: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 rounded-full bg-white/5 overflow-hidden",
          size === "sm" && "h-1.5",
          size === "md" && "h-2",
          size === "lg" && "h-3",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            variant === "default" && "bg-gradient-to-r from-accent-green to-emerald-400",
            variant === "success" && "bg-gradient-to-r from-accent-green to-emerald-400",
            variant === "warning" && "bg-gradient-to-r from-accent-gold to-amber-400",
            variant === "danger" && "bg-gradient-to-r from-accent-red to-rose-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-text-muted min-w-[3ch] text-right tabular-nums">
          {pct}%
        </span>
      )}
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 72,
  strokeWidth = 6,
  className,
  label,
}: CircularProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black tabular-nums">{pct}%</span>
      </div>
      {label && <span className="absolute -bottom-5 text-xs text-text-muted whitespace-nowrap">{label}</span>}
    </div>
  )
}
