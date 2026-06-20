"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white",
            "placeholder:text-text-muted transition-all duration-200",
            "focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20",
            "hover:border-white/20",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
