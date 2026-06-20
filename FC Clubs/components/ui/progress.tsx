"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-text-secondary">{label}</span>}
          {showLabel && <span className="text-xs text-text-muted">{value}/{max}</span>}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-surface-3 overflow-hidden",
          size === "sm" && "h-1.5",
          size === "md" && "h-2.5",
          size === "lg" && "h-3.5"
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "h-full rounded-full",
            variant === "default" && "bg-gradient-to-r from-pitch-600 to-pitch-400",
            variant === "success" && "bg-gradient-to-r from-emerald-600 to-emerald-400",
            variant === "warning" && "bg-gradient-to-r from-yellow-600 to-yellow-400",
            variant === "danger" && "bg-gradient-to-r from-red-600 to-red-400"
          )}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "danger";
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  variant = "default",
  label,
  className,
}: CircularProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const colors = {
    default: "stroke-pitch-500",
    success: "stroke-emerald-500",
    warning: "stroke-yellow-500",
    danger: "stroke-red-500",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-3"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={colors[variant]}
        />
      </svg>
      <span className="text-lg font-bold text-text-primary">{pct}%</span>
      {label && <span className="text-xs text-text-muted">{label}</span>}
    </div>
  );
}