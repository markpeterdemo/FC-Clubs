"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Goal,
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Swords,
  Plus,
  Zap,
} from "lucide-react";
import { FormBar } from "@/components/form-bar";
import { InsightCard } from "@/components/insight-card";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [upcomingMatch, setUpcomingMatch] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [clubRes, reqRes] = await Promise.all([
          fetch("/api/clubs/my"),
          fetch("/api/join-requests/pending-count"),
        ]);

        if (clubRes.ok) {
          const data = await clubRes.json();
          if (data.club) {
            setClub(data.club);
            setStats(data.stats);
            setUpcomingMatch(data.upcomingMatch);
          }
        }

        if (reqRes.ok) {
          const data = await reqRes.json();
          setPendingRequests(data.count);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  if (!club) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
          <AlertCircle size={32} className="text-text-muted" />
        </div>
        <h2 className="text-xl font-semibold">No club yet</h2>
        <p className="text-sm text-text-secondary">Create or join a club to get started.</p>
        <Link href="/join">
          <Button>
            <Plus size={16} />
            Create or Join a Club
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user.global_name || user.username}
          </h1>
          <p className="text-text-secondary">Here's your club overview</p>
        </div>
        <Link href="/join">
          <Button variant="ghost" size="sm">
            Switch Club
          </Button>
        </Link>
      </div>

      {/* Club Card */}
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
      >
        {/* Club accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: club.primary_color || "#22c55e" }}
        />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
              style={{ backgroundColor: club.primary_color || "#22c55e" }}
            >
              {club.short_name || club.name.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{club.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={club.member?.role === "captain" ? "warning" : "info"}
                >
                  {club.member?.role}
                </Badge>
                {club.member?.position && (
                  <Badge>{club.member.position}</Badge>
                )}
              </div>
            </div>
          </div>

          <Link href={`/clubs/${club.id}`}>
            <Button variant="secondary" size="sm">
              View Club
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Played", value: stats.played, icon: Goal },
              { label: "Wins", value: stats.wins, icon: TrendingUp, color: "text-pitch-400" },
              { label: "Points", value: stats.points, icon: Trophy, color: "text-gold" },
              { label: "GD", value: stats.goal_diff > 0 ? `+${stats.goal_diff}` : stats.goal_diff, icon: Swords },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-surface-2 p-3">
                <div className="flex items-center gap-2">
                  <stat.icon size={14} className={cn("text-text-muted", stat.color)} />
                  <span className="text-xs text-text-muted">{stat.label}</span>
                </div>
                <p className={cn("mt-1 text-xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      {club && <InsightCard clubId={club.id} />}

      {/* Two column layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Match */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Next Match</h3>
            <Calendar size={16} className="text-text-muted" />
          </div>

          {upcomingMatch ? (
            <div>
              <div className="flex items-center justify-between rounded-lg bg-surface-2 p-4">
                <div className="text-center">
                  <div
                    className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: club.primary_color }}
                  >
                    {club.short_name}
                  </div>
                  <p className="text-xs font-medium">{club.short_name}</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold">vs</p>
                  <p className="text-xs text-text-muted">
                    {new Date(upcomingMatch.match_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-sm font-bold">
                    {upcomingMatch.away_short || "?"}
                  </div>
                  <p className="text-xs font-medium">{upcomingMatch.away_short || "Away"}</p>
                </div>
              </div>

              <Link href={`/clubs/${club.id}/matches/new`}>
                <Button variant="secondary" size="sm" className="mt-3 w-full">
                  <Swords size={14} />
                  Set Lineup
                </Button>
              </Link>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-text-muted">No upcoming matches</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Club Page", href: `/clubs/${club.id}`, icon: Users },
              { label: "Squad", href: `/clubs/${club.id}/squad`, icon: Users },
              { label: "Set Lineup", href: `/clubs/${club.id}/matches/new`, icon: Swords },
              { label: "Standings", href: "/standings", icon: Trophy },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg bg-surface-2 p-3 transition-colors hover:bg-surface-3"
              >
                <action.icon size={18} className="text-pitch-400" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>

          {pendingRequests > 0 && (
            <Link
              href={`/clubs/${club.id}/settings`}
              className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-900/20 p-3 text-sm text-yellow-400 transition-colors hover:bg-yellow-900/30"
            >
              <AlertCircle size={16} />
              {pendingRequests} pending join request{pendingRequests !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
