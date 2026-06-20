"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Swords, Crosshair, Shield, Trophy, Goal, Eye, Medal } from "lucide-react";
import Link from "next/link";

type StatTab = "goals" | "assists" | "apps";

export default function StatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<StatTab>("goals");
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/players/leaders?stat=${tab}`);
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchLeaders();
  }, [tab]);

  if (loading) return null;

  const tabConfig = [
    { id: "goals" as StatTab, label: "Top Scorers", icon: Swords },
    { id: "assists" as StatTab, label: "Most Assists", icon: Crosshair },
    { id: "apps" as StatTab, label: "Most Appearances", icon: Eye },
  ];

  function getStatValue(player: any): number {
    if (tab === "goals") return player.goals;
    if (tab === "assists") return player.assists;
    return player.apps;
  }

  function getStatLabel(): string {
    if (tab === "goals") return "goals";
    if (tab === "assists") return "assists";
    return "apps";
  }

  function getPositionBadge(i: number) {
    if (i === 0) return <Trophy size={18} className="text-gold" />;
    if (i === 1) return <Medal size={16} className="text-silver" />;
    if (i === 2) return <Medal size={15} className="text-bronze" />;
    return <span className="text-sm tabular-nums text-text-muted w-5 text-center">{i + 1}</span>;
  }

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.05}>
        <StaggerItem>
          <div>
            <h1 className="text-2xl font-bold">Stats</h1>
            <p className="text-text-secondary text-sm mt-0.5">League leaders and player statistics</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Tabs
            tabs={tabConfig.map((t) => ({
              id: t.id,
              label: t.label,
              icon: <t.icon size={16} />,
            }))}
            activeTab={tab}
            onChange={(id) => setTab(id as StatTab)}
          />
        </StaggerItem>

        <StaggerItem>
          {loadingData ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div className="py-16 text-center">
              <Goal size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted">No stats available yet</p>
              <p className="text-xs text-text-muted mt-1">Stats will appear once matches are played</p>
            </div>
          ) : (
            <Card variant="glass" padding="none" className="divide-y divide-border/50">
              {leaders.map((player: any, i: number) => {
                const statValue = getStatValue(player);
                const maxValue = getStatValue(leaders[0]);
                const barWidth = maxValue > 0 ? (statValue / maxValue) * 100 : 0;
                return (
                  <Link
                    key={player.user_id}
                    href={`/profile/${player.user_id}`}
                    className="block transition-colors hover:bg-surface-2/30"
                  >
                    <div className="relative px-5 py-4 overflow-hidden">
                      {/* Background bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-pitch-500/[0.04] to-pitch-500/[0.02] rounded-r-xl"
                      />

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex w-7 justify-center shrink-0">
                            {getPositionBadge(i)}
                          </div>

                          <DiscordAvatar
                            discordId={player.discord_id}
                            avatarHash={player.avatar}
                            size={40}
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {player.global_name || player.username}
                              </span>
                              <span className="text-xs text-text-muted hidden sm:block">@{player.username}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: player.club_color || "#334155" }}
                              >
                                {player.club_short_name || "?"}
                              </div>
                              {player.position && <Badge variant="default" className="text-[10px]">{player.position}</Badge>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <motion.p
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="text-xl font-bold text-pitch-400 tabular-nums"
                          >
                            {statValue}
                          </motion.p>
                          <p className="text-xs text-text-muted">{getStatLabel()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}