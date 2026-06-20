import { Goal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const iconSizes = { sm: 20, md: 28, lg: 36 };
  const containerSizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
  const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 shadow-lg shadow-pitch-500/25",
          containerSizes[size]
        )}
      >
        <Goal size={iconSizes[size]} className="text-white" />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", textSizes[size])}>
          <span className="text-gradient">Matchday</span>
        </span>
      )}
    </div>
  );
}