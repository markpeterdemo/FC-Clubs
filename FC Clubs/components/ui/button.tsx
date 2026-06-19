import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "discord";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pitch-500/50 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-pitch-600 text-white hover:bg-pitch-500 active:bg-pitch-700":
              variant === "primary",
            "bg-surface-2 text-text-primary hover:bg-surface-3 border border-border":
              variant === "secondary",
            "text-text-secondary hover:text-text-primary hover:bg-surface-2":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-500": variant === "danger",
            "bg-discord text-white hover:bg-discord-hover": variant === "discord",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
