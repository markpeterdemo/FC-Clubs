"use client";

import { useState, useEffect } from "react";
import { BADGES, getBadge } from "@/lib/achievements";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  userId: string;
  className?: string;
}

export function BadgeGrid({ userId, className }: BadgeGridProps) {
  const [earnedKeys, setEarnedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/achievements?user_id=${userId}`)
      .then((r) => r.json())
      .then((d) => setEarnedKeys(d.achievements?.map((a: any) => a.badge_key) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-10 animate-pulse rounded-lg bg-surface-3" />
        ))}
      </div>
    );
  }

  if (earnedKeys.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-text-secondary">
        Badges ({earnedKeys.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {earnedKeys.map((key) => {
          const badge = getBadge(key);
          if (!badge) return null;
          return (
            <Tooltip key={key} content={
              <div className="text-center">
                <p className="font-medium text-sm">{badge.icon} {badge.name}</p>
                <p className="text-xs text-text-muted">{badge.description}</p>
              </div>
            }>
              <div className="flex h-10 w-10 cursor-help items-center justify-center rounded-lg bg-surface-2 text-lg transition-all hover:bg-surface-3 hover:scale-110">
                {badge.emoji}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
