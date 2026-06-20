"use client";

import { useAuth } from "@/lib/auth-context";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate } from "@/lib/utils";
import { FormBar } from "@/components/form-bar";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Swords,
  Calendar,
  Settings,
  Plus,
  UserPlus,
  UserCheck,
  Clock,
  MapPin,
  ChevronRight,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ClubPageClientProps {
  club: any;
  members: any[];
  stats: any;
  matches: any[];
}

export function ClubPageClient({ club, members, stats, matches }: ClubPageClientProps) {
  const { user } = useAuth();
  const currentMember = members.find((m: any) => m.user_id === user?.id);
  const isCaptain = currentMember?.role === "captain";
  const isManager = currentMember?.role === "manager";
  const [formResults, setFormResults] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/clubs/${club.id}/form`)
      .then((r) => r.ok ? r.json() : { form: [] })
      .then((d) => setFormResults(d.form || []))
      .catch(() => {});
  }, [club.id]);

  const isMember = !!currentMember;
  const pts = stats ? stats.wins * 3 + stats.draws : 0;
  const gd = stats ? stats.goals_for - stats.goals_against : 0;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.05}>
        {/* Hero */}
        <StaggerItem>
          <Card variant="glass" padding="none" className="overflow-hidden">
            <div className="relative h-36" style={{
              background: `linear-gradient(135deg, ${club.primary_color}99, ${club.primary_color}22, var(--color-surface))`,
            }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
            </div>

            <div className="relative px-6 pb-6">
              <div className="-mt-14 mb-4 flex items-end justify-between">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-surface text-2xl font-bold text-white shadow-xl"
                  style={{ backgroundColor: club.primary_color || "#22c55e" }}
                >
                  {club.short_name || club.name.slice(0, 3).toUpperCase()}
                </motion.div>

                <div className="flex gap-2 pt-2">
                  {(isCaptain || isManager) && (
                    <Link href={`/clubs/${club.id}/settings`}>
                      <Button variant="secondary" size="sm">
                        <Settings size={14} />
                        Manage
                      </Button>
                    </Link>
                  )}
                  {isCaptain && (
                    <Link href={`/clubs/${club.id}/matches/new`}>
                      <Button size="sm">
                        <Swords size={14} />
                        New Match
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{club.name}</h1>
                  <div className="mt-1.5 flex items-center gap-2 text-sm text-text-secondary">
                    <Badge variant={club.visibility === "public" ? "success" : "info"}>
                      {club.visibility === "public" ? "Open" : "Private"}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {members.length} / {club.max_members || 20} members
                    </span>
                  </div>
                  {club.description && (
                    <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-xl">{club.description}</p>
                  )}
                </div>

                {formResults.length > 0 && (
                  <div className="shrink-0">
                    <p className="text-xs text-text-muted mb-1.5 font-medium">Recent Form</p>
                    <FormBar results={formResults} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </StaggerItem>

        {/* Stats */}
        {stats && (
          <StaggerItem>
            <Card variant="elevated" padding="md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity size={16} className="text-text-muted" />
                  Season Record
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                  {[
                    { label: "P", value: stats.played, color: "" },
                    { label: "W", value: stats.wins, color: "text-pitch-400" },
                    { label: "D", value: stats.draws, color: "" },
                    { label: "L", value: stats.losses, color: "text-red-400" },
                    { label: "GF", value: stats.goals_for, color: "text-pitch-300" },
                    { label: "GA", value: stats.goals_against, color: "" },
                    { label: "Pts", value: pts, color: "text-gold" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-surface-2/50 border border-border/50 p-2.5 text-center transition-all hover:bg-surface-2">
                      <p className={cn("text-xs text-text-muted", stat.color)}>{stat.label}</p>
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("text-lg font-bold tabular-nums", stat.color)}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                  <Progress value={stats.played ? (stats.wins / stats.played) * 100 : 0} variant="success" size="sm" className="flex-1" showLabel label="Win Rate" />
                  <span className={cn("text-sm font-semibold tabular-nums", gd > 0 ? "text-pitch-400" : gd < 0 ? "text-red-400" : "")}>
                    GD {gd > 0 ? `+${gd}` : gd}
                  </span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Roster + Matches */}
        <div className="grid gap-6 md:grid-cols-2">
          <StaggerItem>
            <Card variant="glass" padding="md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users size={16} className="text-text-muted" />
                  Roster
                </CardTitle>
                <span className="text-xs text-text-muted">{members.length} players</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {members.map((member: any, i: number) => (
                    <motion.div
                      key={member.user_id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="flex items-center justify-between rounded-xl bg-surface-2/50 border border-border/50 p-2.5 transition-all duration-200 hover:bg-surface-2 hover:border-border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-4 text-xs text-text-muted text-right tabular-nums">{i + 1}</span>
                        <DiscordAvatar
                          discordId={member.discord_id}
                          avatarHash={member.avatar}
                          size={32}
                        />
                        <div className="min-w-0">
                          <a
                            href={`/profile/${member.user_id}`}
                            className="text-sm font-medium hover:text-pitch-400 transition-colors truncate block"
                          >
                            {member.global_name || member.username}
                          </a>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {member.position && (
                              <Badge variant="default" className="text-[10px] px-1.5">{member.position}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          member.role === "captain" ? "warning"
                          : member.role === "manager" ? "info"
                          : member.role === "sub" ? "default"
                          : "success"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {member.role}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card variant="glass" padding="md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar size={16} className="text-text-muted" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Swords size={28} className="text-text-muted mb-2" />
                    <p className="text-sm text-text-muted">No matches yet</p>
                    {isCaptain && (
                      <Link href={`/clubs/${club.id}/matches/new`} className="mt-3">
                        <Button variant="primary" size="sm">
                          <Plus size={14} />
                          Schedule Match
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matches.map((match: any) => {
                      const isHome = match.home_club_id === club.id;
                      const opponent = isHome
                        ? { name: match.away_name, short: match.away_short, color: match.away_color }
                        : { name: match.home_name, short: match.home_short, color: match.home_color };
                      const ourScore = isHome ? match.home_score : match.away_score;
                      const theirScore = isHome ? match.away_score : match.home_score;
                      const isWin = ourScore !== null && theirScore !== null && ourScore > theirScore;
                      const isDraw = ourScore !== null && theirScore !== null && ourScore === theirScore;

                      return (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between rounded-xl bg-surface-2/50 border border-border/50 p-3 transition-all hover:bg-surface-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: opponent.color || "#334155" }}
                            >
                              {opponent.short || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{opponent.name}</p>
                              <p className="text-xs text-text-muted flex items-center gap-1">
                                <MapPin size={10} />
                                {isHome ? "Home" : "Away"} · {formatDate(match.match_date)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-3">
                            {ourScore !== null ? (
                              <p className={cn(
                                "text-lg font-bold tabular-nums",
                                isWin ? "text-pitch-400" : isDraw ? "text-text-secondary" : "text-red-400"
                              )}>
                                {ourScore} - {theirScore}
                              </p>
                            ) : (
                              <Badge variant="info">Upcoming</Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </StaggerItem>
        </div>

        {/* Join CTA for non-members */}
        {!isMember && (
          <StaggerItem>
            <Card variant="gradient" padding="lg" className="text-center">
              <h2 className="text-lg font-bold">Want to join {club.name}?</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {club.visibility === "public"
                  ? "This club is open — join instantly!"
                  : "This club is private — send a request to the captain."}
              </p>
              <Button variant="premium" className="mt-4">
                {club.visibility === "public" ? (
                  <><UserCheck size={16} /> Join Club</>
                ) : (
                  <><Clock size={16} /> Request to Join</>
                )}
              </Button>
            </Card>
          </StaggerItem>
        )}
      </StaggerContainer>
    </PageTransition>
  );
}