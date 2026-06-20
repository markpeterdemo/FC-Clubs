import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "discord" | "premium";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pitch-500/40 disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            "bg-pitch-600 text-white hover:bg-pitch-500 active:bg-pitch-700 shadow-lg shadow-pitch-600/20 hover:shadow-pitch-500/30 active:scale-[0.97]":
              variant === "primary",
            "bg-surface-2/80 text-text-primary hover:bg-surface-3 border border-border hover:border-border-light shadow-sm hover:shadow-md active:scale-[0.97]":
              variant === "secondary",
            "text-text-secondary hover:text-text-primary hover:bg-surface-2/60 active:scale-[0.97]":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-lg shadow-red-600/20 active:scale-[0.97]":
              variant === "danger",
            "bg-discord text-white hover:bg-discord-hover active:scale-[0.97] shadow-lg shadow-discord/20":
              variant === "discord",
            "text-white shadow-lg shadow-pitch-500/25 hover:shadow-pitch-500/40 active:scale-[0.97] relative overflow-hidden":
              variant === "premium",
          },
          variant === "premium" && "bg-gradient-to-br from-pitch-500 via-pitch-600 to-pitch-700 hover:from-pitch-400 hover:via-pitch-500 hover:to-pitch-600 hover:shadow-pitch-400/30",
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
