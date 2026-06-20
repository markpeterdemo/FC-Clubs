"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FormBar } from "@/components/form-bar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
      <div className="space-y-6 py-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  function getPositionIcon(i: number) {
    if (i === 0) return <Trophy size={16} className="text-gold" />;
    if (i === 1) return <Medal size={16} className="text-silver" />;
    if (i === 2) return <Medal size={16} className="text-bronze" />;
    return <span className="text-sm tabular-nums text-text-muted">{i + 1}</span>;
  }

  function getTrendIcon(current: number, prev?: number) {
    if (!prev) return null;
    if (current < prev) return <TrendingUp size={12} className="text-pitch-400" />;
    if (current > prev) return <TrendingDown size={12} className="text-red-400" />;
    return <Minus size={12} className="text-text-muted" />;
  }

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.05}>
        <StaggerItem>
          <div>
            <h1 className="text-2xl font-bold">Standings</h1>
            <p className="text-text-secondary text-sm mt-0.5">Current league table</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Card variant="glass" padding="none" className="overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-[36px_1fr_48px_48px_48px_48px_56px_56px_120px] gap-2 border-b border-border bg-surface-2/50 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted items-center">
              <span className="text-center">#</span>
              <span>Club</span>
              <span className="text-center">P</span>
              <span className="text-center">W</span>
              <span className="text-center">D</span>
              <span className="text-center">L</span>
              <span className="text-center">GD</span>
              <span className="text-center">Pts</span>
              <span className="text-center">Form</span>
            </div>

            {/* Desktop rows */}
            <div className="hidden md:block">
              {standings.map((club: any, i: number) => {
                const form = formMap[club.id] || [];
                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "grid grid-cols-[36px_1fr_48px_48px_48px_48px_56px_56px_120px] gap-2 px-4 py-3 transition-all duration-150 items-center hover:bg-surface-2/30",
                      i < 3 && "border-b border-border/50",
                    )}
                  >
                    <div className="flex items-center justify-center">{getPositionIcon(i)}</div>

                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: club.primary_color || "#334155" }}
                      >
                        {club.short_name || club.name.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-medium">{club.name}</span>
                    </div>

                    <span className="flex items-center justify-center text-sm tabular-nums">{club.played}</span>
                    <span className="flex items-center justify-center text-sm tabular-nums text-pitch-400">{club.wins}</span>
                    <span className="flex items-center justify-center text-sm tabular-nums text-text-secondary">{club.draws}</span>
                    <span className="flex items-center justify-center text-sm tabular-nums text-red-400">{club.losses}</span>
                    <span
                      className={cn(
                        "flex items-center justify-center text-sm font-medium tabular-nums",
                        club.goal_diff > 0 ? "text-pitch-400" : club.goal_diff < 0 ? "text-red-400" : "text-text-muted"
                      )}
                    >
                      {club.goal_diff > 0 ? `+${club.goal_diff}` : club.goal_diff}
                    </span>

                    <span className="flex items-center justify-center text-sm font-bold tabular-nums">{club.points}</span>

                    <div className="flex items-center justify-center">
                      {form.length > 0 ? (
                        <FormBar results={form} size="sm" showLabel={false} />
                      ) : (
                        <span className="text-[10px] text-text-muted">—</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border/50">
              {standings.map((club: any, i: number) => {
                const form = formMap[club.id] || [];
                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-6">{getPositionIcon(i)}</div>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: club.primary_color || "#334155" }}
                        >
                          {club.short_name || club.name.slice(0, 3).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm truncate">{club.name}</span>
                      </div>
                      <span className="text-lg font-bold tabular-nums">{club.points}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="bg-surface-2/50 rounded-lg p-1.5">
                        <span className="text-text-muted block">P</span>
                        <span className="font-medium tabular-nums">{club.played}</span>
                      </div>
                      <div className="bg-surface-2/50 rounded-lg p-1.5">
                        <span className="text-text-muted block">W</span>
                        <span className="font-medium text-pitch-400 tabular-nums">{club.wins}</span>
                      </div>
                      <div className="bg-surface-2/50 rounded-lg p-1.5">
                        <span className="text-text-muted block">D</span>
                        <span className="font-medium tabular-nums">{club.draws}</span>
                      </div>
                      <div className="bg-surface-2/50 rounded-lg p-1.5">
                        <span className="text-text-muted block">L</span>
                        <span className="font-medium text-red-400 tabular-nums">{club.losses}</span>
                      </div>
                      <div className="bg-surface-2/50 rounded-lg p-1.5">
                        <span className="text-text-muted block">GD</span>
                        <span
                          className={cn(
                            "font-medium tabular-nums",
                            club.goal_diff > 0 ? "text-pitch-400" : club.goal_diff < 0 ? "text-red-400" : ""
                          )}
                        >
                          {club.goal_diff > 0 ? `+${club.goal_diff}` : club.goal_diff}
                        </span>
                      </div>
                    </div>

                    {form.length > 0 && (
                      <div className="flex items-center justify-center gap-1.5">
                        <FormBar results={form} size="sm" showLabel={false} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {standings.length === 0 && (
              <div className="py-16 text-center">
                <Trophy size={32} className="mx-auto mb-3 text-text-muted" />
                <p className="text-text-muted">No standings data available yet</p>
              </div>
            )}
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}