"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white appearance-none",
          "transition-all duration-200 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20",
          "hover:border-white/20 cursor-pointer",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22rgba(255%2C255%2C255%2C0.4)%22%3E%3Cpath%20d%3D%22M4%206l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] pr-10",
          className
        )}
        {...props}
      >
        {placeholder && <option value="" className="bg-bg-card">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-bg-card">
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
