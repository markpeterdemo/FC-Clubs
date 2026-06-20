import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-300 focus:border-pitch-500/50 focus:outline-none focus:ring-2 focus:ring-pitch-500/15 focus:bg-surface-2 backdrop-blur-sm",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
