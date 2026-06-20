"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/page-transition";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  Clock,
  Activity,
  BarChart3,
  ChevronRight,
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
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!club) {
    return (
      <PageTransition>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pitch-500/20 to-pitch-700/20 ring-1 ring-pitch-500/20">
              <Users size={40} className="text-pitch-400" />
            </div>
          </motion.div>
          <h2 className="text-xl font-bold">No club yet</h2>
          <p className="text-sm text-text-secondary max-w-xs">
            Create or join a club to start managing your team, tracking stats, and competing in leagues.
          </p>
          <Link href="/join">
            <Button variant="premium">
              <Plus size={16} />
              Create or Join a Club
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const statCards = [
    { label: "Played", value: stats?.played ?? 0, icon: Activity, color: "text-text-primary" },
    { label: "Wins", value: stats?.wins ?? 0, icon: TrendingUp, color: "text-pitch-400" },
    { label: "Points", value: stats?.points ?? 0, icon: Trophy, color: "text-gold" },
    { label: "GD", value: stats?.goal_diff != null ? (stats.goal_diff > 0 ? `+${stats.goal_diff}` : stats.goal_diff) : 0, icon: BarChart3, color: (stats?.goal_diff ?? 0) > 0 ? "text-pitch-400" : (stats?.goal_diff ?? 0) < 0 ? "text-red-400" : "text-text-primary" },
  ];

  const winRate = stats?.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.06}>
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user.global_name || user.username}
              </h1>
              <p className="text-text-secondary text-sm mt-0.5">Here's your club overview</p>
            </div>
            <Link href="/join">
              <Button variant="ghost" size="sm">
                Switch Club
              </Button>
            </Link>
          </div>
        </StaggerItem>

        {/* Club Card */}
        <StaggerItem>
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="relative p-6">
              <div
                className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-60"
                style={{ color: club.primary_color || "#22c55e" }}
              />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
                    style={{ backgroundColor: club.primary_color || "#22c55e" }}
                  >
                    {club.short_name || club.name.slice(0, 3).toUpperCase()}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold">{club.name}</h2>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant={club.member?.role === "captain" ? "warning" : "info"}>
                        {club.member?.role}
                      </Badge>
                      {club.member?.position && (
                        <Badge variant="default">{club.member.position}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Link href={`/clubs/${club.id}`}>
                  <Button variant="secondary" size="sm">
                    View Club
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>

              {/* Stats Grid */}
              {stats && (
                <StaggerContainer className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" staggerDelay={0.04}>
                  {statCards.map((stat) => (
                    <StaggerItem key={stat.label}>
                      <div className="rounded-xl bg-surface-2/50 border border-border/50 p-3.5 transition-all duration-200 hover:bg-surface-2 hover:border-border">
                        <div className="flex items-center gap-2">
                          <stat.icon size={14} className={cn("text-text-muted", stat.color)} />
                          <span className="text-xs text-text-muted">{stat.label}</span>
                        </div>
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className={cn("mt-1 text-xl font-bold", stat.color)}
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>

            {/* Win rate bar */}
            <div className="border-t border-border px-6 py-3.5 bg-surface-2/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-text-secondary">Win Rate</span>
                <Progress value={winRate} variant={winRate >= 50 ? "success" : "warning"} size="sm" className="flex-1" showLabel label={`${winRate}%`} />
              </div>
            </div>
          </Card>
        </StaggerItem>

        {/* Insights */}
        <StaggerItem>
          {club && <InsightCard clubId={club.id} />}
        </StaggerItem>

        {/* Two column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          <StaggerItem>
            <Card variant="glass" padding="md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={16} className="text-text-muted" />
                  Next Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMatch ? (
                  <div>
                    <div className="flex items-center justify-between rounded-xl bg-surface-2/50 border border-border/50 p-4">
                      <div className="text-center flex-1">
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                          style={{ backgroundColor: club.primary_color }}
                        >
                          {club.short_name}
                        </motion.div>
                        <p className="text-xs font-medium text-text-primary">{club.short_name}</p>
                      </div>

                      <div className="flex flex-col items-center gap-1 px-6">
                        <span className="text-sm font-bold text-text-muted">VS</span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(upcomingMatch.match_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="text-center flex-1">
                        <div className="mx-auto mb-1.5 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-3 text-sm font-bold">
                          {upcomingMatch.away_short || "?"}
                        </div>
                        <p className="text-xs font-medium text-text-primary">{upcomingMatch.away_short || "Away"}</p>
                      </div>
                    </div>

                    <Link href={`/clubs/${club.id}/matches/new`}>
                      <Button variant="primary" size="sm" className="mt-3 w-full">
                        <Swords size={14} />
                        Set Lineup
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar size={28} className="text-text-muted mb-3" />
                    <p className="text-sm text-text-muted">No upcoming matches scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card variant="glass" padding="md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap size={16} className="text-text-muted" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Club Page", href: `/clubs/${club.id}`, icon: Users, desc: "View club details" },
                    { label: "Set Lineup", href: `/clubs/${club.id}/matches/new`, icon: Swords, desc: "Pick your team" },
                    { label: "Standings", href: "/standings", icon: Trophy, desc: "League table" },
                    { label: "Stats", href: "/stats", icon: BarChart3, desc: "Player leaders" },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="group flex flex-col gap-1.5 rounded-xl bg-surface-2/50 border border-border/50 p-3 transition-all duration-200 hover:bg-surface-2 hover:border-border hover:-translate-y-0.5"
                    >
                      <action.icon size={18} className="text-pitch-400 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-xs text-text-muted">{action.desc}</span>
                    </Link>
                  ))}
                </div>

                {pendingRequests > 0 && (
                  <Link
                    href={`/clubs/${club.id}/settings`}
                    className="mt-3 flex items-center gap-2.5 rounded-xl bg-yellow-900/20 border border-yellow-800/30 p-3 text-sm text-yellow-400 transition-all duration-200 hover:bg-yellow-900/30 hover:border-yellow-700/40"
                  >
                    <AlertCircle size={16} />
                    <span className="font-medium">{pendingRequests}</span> pending join request{pendingRequests !== 1 ? "s" : ""}
                  </Link>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </PageTransition>
  );
}