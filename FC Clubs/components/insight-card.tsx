"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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
  positive: "border-pitch-500/30 bg-pitch-500/5",
  negative: "border-red-500/30 bg-red-500/5",
  neutral: "border-border bg-surface-2/50",
  record: "border-yellow-500/30 bg-yellow-500/5",
};

const typeIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Info,
  record: Zap,
};

const typeColors = {
  positive: "text-pitch-400",
  negative: "text-red-400",
  neutral: "text-text-muted",
  record: "text-yellow-400",
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
      <Card variant="default" padding="md" className={className}>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  if (insights.length === 0) return null;

  return (
    <Card variant="elevated" padding="md" className={className}>
      <CardTitle className="flex items-center gap-2 text-sm">
        <Zap size={16} className="text-yellow-400" />
        Insights
      </CardTitle>
      <CardContent className="mt-3 space-y-2">
        {insights.map((insight, i) => {
          const Icon = typeIcons[insight.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-all hover:shadow-sm",
                typeStyles[insight.type]
              )}
            >
              <Icon size={16} className={cn("mt-0.5 shrink-0", typeColors[insight.type])} />
              <span className="text-text-primary leading-relaxed">{insight.message}</span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}