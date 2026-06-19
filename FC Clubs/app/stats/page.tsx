"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Swords, Crosshair, Shield, Trophy, Goal, Eye } from "lucide-react";
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

  const tabs: { key: StatTab; label: string; icon: any }[] = [
    { key: "goals", label: "Top Scorers", icon: Swords },
    { key: "assists", label: "Most Assists", icon: Crosshair },
    { key: "apps", label: "Most Appearances", icon: Shield },
  ];

  if (loading) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Stats</h1>
        <p className="text-text-secondary">League leaders and player statistics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-pitch-900/30 text-pitch-400 border border-pitch-600/30"
                  : "text-text-secondary hover:bg-surface-2 border border-transparent"
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard */}
      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {leaders.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              No stats available yet
            </div>
          ) : (
            leaders.map((player: any, i: number) => (
              <Link
                key={player.user_id}
                href={`/profile/${player.user_id}`}
                className={cn(
                  "flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-2",
                  i !== leaders.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex w-6 justify-center">
                    {i === 0 && <Trophy size={18} className="text-gold" />}
                    {i === 1 && <Trophy size={16} className="text-silver" />}
                    {i === 2 && <Trophy size={14} className="text-bronze" />}
                    {i > 2 && (
                      <span className="text-sm text-text-muted">{i + 1}</span>
                    )}
                  </div>

                  <DiscordAvatar
                    discordId={player.discord_id}
                    avatarHash={player.avatar}
                    size={40}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {player.global_name || player.username}
                      </span>
                      <span className="text-sm text-text-muted">@{player.username}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: player.club_color || "#334155" }}
                      >
                        {player.club_short_name || "?"}
                      </div>
                      <Badge className="text-[10px]">{player.position}</Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-pitch-400">
                    {tab === "goals"
                      ? player.goals
                      : tab === "assists"
                      ? player.assists
                      : player.apps}
                  </p>
                  <p className="text-xs text-text-muted">
                    {tab === "goals" ? "goals" : tab === "assists" ? "assists" : "apps"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
