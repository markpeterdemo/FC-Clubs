"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FormBar } from "@/components/form-bar";
import { Trophy, Medal } from "lucide-react";

export default function StandingsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [formMap, setFormMap] = useState<Record<string, any[]>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [standingsRes, formRes] = await Promise.all([
          fetch("/api/standings"),
          fetch("/api/standings/form"),
        ]);

        if (standingsRes.ok) {
          const data = await standingsRes.json();
          setStandings(data.standings);
        }

        if (formRes.ok) {
          const data = await formRes.json();
          setFormMap(data.formMap || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Standings</h1>
        <p className="text-text-secondary">Current league table</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="grid grid-cols-[32px_1fr_repeat(6,48px)_140px] gap-1 border-b border-border bg-surface-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span>#</span>
          <span>Club</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GD</span>
          <span className="text-center">Pts</span>
          <span className="text-center">Form</span>
        </div>

        {/* Rows */}
        {standings.map((club: any, i: number) => {
          const form = formMap[club.id] || [];
          return (
            <div
              key={club.id}
              className={cn(
                "grid grid-cols-[32px_1fr_repeat(6,48px)_140px] gap-1 px-4 py-3 transition-colors hover:bg-surface-2",
                i < 3 && "border-b border-border",
                i === standings.length - 1 && "border-t border-border"
              )}
            >
              {/* Position */}
              <div className="flex items-center">
                {i === 0 ? (
                  <Trophy size={16} className="text-gold" />
                ) : i === 1 ? (
                  <Medal size={16} className="text-silver" />
                ) : i === 2 ? (
                  <Medal size={16} className="text-bronze" />
                ) : (
                  <span className="text-sm text-text-muted">{i + 1}</span>
                )}
              </div>

              {/* Club Name */}
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: club.primary_color || "#334155" }}
                >
                  {club.short_name || club.name.slice(0, 3).toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium">{club.name}</span>
              </div>

              {/* Stats */}
              <span className="flex items-center justify-center text-sm">{club.played}</span>
              <span className="flex items-center justify-center text-sm text-pitch-400">{club.wins}</span>
              <span className="flex items-center justify-center text-sm">{club.draws}</span>
              <span className="flex items-center justify-center text-sm text-red-400">{club.losses}</span>
              <span
                className={cn(
                  "flex items-center justify-center text-sm font-medium",
                  club.goal_diff > 0
                    ? "text-pitch-400"
                    : club.goal_diff < 0
                    ? "text-red-400"
                    : "text-text-muted"
                )}
              >
                {club.goal_diff > 0 ? `+${club.goal_diff}` : club.goal_diff}
              </span>

              {/* Points */}
              <span className="flex items-center justify-center text-sm font-bold">{club.points}</span>

              {/* Form */}
              <div className="flex items-center justify-center">
                {form.length > 0 ? (
                  <FormBar results={form} size="sm" showLabel={false} />
                ) : (
                  <span className="text-[10px] text-text-muted">—</span>
                )}
              </div>
            </div>
          );
        })}

        {standings.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            No standings data available yet
          </div>
        )}
      </div>
    </div>
  );
}
