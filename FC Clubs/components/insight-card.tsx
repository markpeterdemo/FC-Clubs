"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Info, AlertCircle, Zap,
} from "lucide-react";

interface Insight {
  type: "positive" | "negative" | "neutral" | "record";
  message: string;
  icon?: string;
}

interface InsightCardProps {
  clubId: string;
  className?: string;
}

const typeStyles = {
  positive: "border-pitch-600/30 bg-pitch-900/20",
  negative: "border-red-600/30 bg-red-900/20",
  neutral: "border-border bg-surface-2",
  record: "border-yellow-600/30 bg-yellow-900/20",
};

const typeIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Info,
  record: Zap,
};

export function InsightCard({ clubId, className }: InsightCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/insights?club_id=${clubId}&type=form`)
      .then((r) => r.ok ? r.json() : { insights: [] })
      .then((d) => setInsights(d.insights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="h-4 w-32 animate-pulse rounded bg-surface-3 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-3" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Zap size={16} className="text-yellow-400" />
        Insights
      </h3>
      <div className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = typeIcons[insight.type];
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-sm",
                typeStyles[insight.type]
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0 text-text-secondary" />
              <span className="text-text-primary">{insight.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
