"use client";

import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface FormResult {
  won: boolean;
  drew: boolean;
  home_score: number;
  away_score: number;
  is_home: boolean;
  opponent_short: string;
  match_date: string;
}

interface FormBarProps {
  results: FormResult[];
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function FormBar({ results, size = "md", showLabel = true }: FormBarProps) {
  if (results.length === 0) return null;

  const barSize = size === "sm" ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs";

  return (
    <div className="flex items-center gap-1">
      {showLabel && results.length > 0 && (
        <span className="text-xs text-text-muted mr-1 shrink-0">Form</span>
      )}
      {results.map((r, i) => (
        <Tooltip
          key={i}
          content={
            <div className="text-xs">
              <span className="font-medium">{r.is_home ? `${r.home_score} - ${r.away_score}` : `${r.away_score} - ${r.home_score}`}</span>
              <span className="text-text-muted ml-1">vs {r.opponent_short}</span>
            </div>
          }
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-sm font-bold text-white transition-transform hover:scale-110",
              barSize,
              r.won && "bg-pitch-500",
              r.drew && "bg-yellow-500",
              !r.won && !r.drew && "bg-red-500"
            )}
          >
            {r.won ? "W" : r.drew ? "D" : "L"}
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
