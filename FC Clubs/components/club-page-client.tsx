"use client";

import { useAuth } from "@/lib/auth-context";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { FormBar } from "@/components/form-bar";
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <div
          className="h-32 rounded-t-xl"
          style={{
            background: `linear-gradient(135deg, ${club.primary_color}88, ${club.primary_color}11)`,
          }}
        />

        <div className="relative px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card text-2xl font-bold text-white shadow-xl"
              style={{ backgroundColor: club.primary_color || "#22c55e" }}
            >
              {club.short_name || club.name.slice(0, 3).toUpperCase()}
            </div>

            <div className="flex gap-2">
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

          <h1 className="text-2xl font-bold">{club.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
            <Badge
              variant={club.visibility === "public" ? "success" : "info"}
            >
              {club.visibility === "public" ? "Open" : "Private"}
            </Badge>
            <span>{members.length} / {club.max_members || 20} members</span>
          </div>
          {formResults.length > 0 && (
            <div className="mt-3">
              <FormBar results={formResults} />
            </div>
          )}
          {club.description && (
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">{club.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Season Record</h2>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {[
              { label: "P", value: stats.played },
              { label: "W", value: stats.wins, color: "text-pitch-400" },
              { label: "D", value: stats.draws },
              { label: "L", value: stats.losses, color: "text-red-400" },
              { label: "GF", value: stats.goals_for },
              { label: "GA", value: stats.goals_against },
              { label: "Pts", value: stats.wins * 3 + stats.draws, color: "text-gold", bold: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-surface-2 p-2">
                <p className={cn("text-xs text-text-muted", stat.color)}>{stat.label}</p>
                <p className={cn("text-lg font-bold", stat.color, stat.bold && "text-lg")}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-text-muted">
            <span className="text-pitch-400">{stats.wins}W</span>
            <span>{stats.draws}D</span>
            <span className="text-red-400">{stats.losses}L</span>
            <span className="text-text-secondary">
              · GD {stats.goals_for - stats.goals_against > 0
                ? `+${stats.goals_for - stats.goals_against}`
                : stats.goals_for - stats.goals_against}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Roster */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Roster</h2>
            <Users size={16} className="text-text-muted" />
          </div>

          <div className="space-y-2">
            {members.map((member: any, i: number) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between rounded-lg bg-surface-2 p-3 transition-colors hover:bg-surface-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs text-text-muted">{i + 1}</span>
                  <DiscordAvatar
                    discordId={member.discord_id}
                    avatarHash={member.avatar}
                    size={32}
                  />
                  <div>
                    <a
                      href={`/profile/${member.user_id}`}
                      className="text-sm font-medium hover:text-pitch-400 transition-colors"
                    >
                      {member.global_name || member.username}
                    </a>
                    <div className="flex items-center gap-1.5">
                      {member.position && (
                        <Badge className="text-[10px] px-1.5 py-0">{member.position}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    member.role === "captain"
                      ? "warning"
                      : member.role === "manager"
                      ? "info"
                      : member.role === "sub"
                      ? "default"
                      : "success"
                  }
                  className="text-[10px]"
                >
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Matches</h2>
            <Calendar size={16} className="text-text-muted" />
          </div>

          {matches.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No matches yet</p>
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
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg bg-surface-2 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: opponent.color || "#334155" }}
                      >
                        {opponent.short || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{opponent.name}</p>
                        <p className="text-xs text-text-muted">{formatDate(match.match_date)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {ourScore !== null ? (
                        <p
                          className={cn(
                            "text-lg font-bold",
                            isWin
                              ? "text-pitch-400"
                              : isDraw
                              ? "text-text-secondary"
                              : "text-red-400"
                          )}
                        >
                          {ourScore} - {theirScore}
                        </p>
                      ) : (
                        <Badge variant="info">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {matches.length > 0 && (
            <Link
              href={`/clubs/${club.id}/matches`}
              className="mt-3 block text-center text-sm text-pitch-400 hover:text-pitch-300"
            >
              View all matches
            </Link>
          )}
        </div>
      </div>

      {/* Join / Request section for non-members */}
      {!currentMember && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Want to join {club.name}?</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {club.visibility === "public"
              ? "This club is open — join instantly!"
              : "This club is private — send a request to the captain."}
          </p>
          <Button className="mt-4">
            {club.visibility === "public" ? (
              <>
                <UserCheck size={16} />
                Join Club
              </>
            ) : (
              <>
                <Clock size={16} />
                Request to Join
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
