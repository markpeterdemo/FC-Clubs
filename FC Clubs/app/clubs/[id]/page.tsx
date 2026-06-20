"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/auth-context"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatDate, timeAgo, rarityFromRating, overallRating } from "@/lib/utils"
import {
  Shield, Users, Swords, Calendar, Trophy, Plus, Settings,
  MapPin, Goal, ArrowUp, ArrowDown, Minus, Eye,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface ClubData {
  club: {
    id: string
    name: string
    short_name: string | null
    logo_url: string | null
    primary_color: string
    description: string | null
    visibility: "public" | "private"
    max_members: number
    created_at: string
  }
  stats: {
    played: number
    wins: number
    draws: number
    losses: number
    goals_for: number
    goals_against: number
  } | null
  members: {
    id: string
    user_id: string
    username: string
    global_name: string | null
    avatar: string | null
    discord_id: string
    role: "captain" | "manager" | "player" | "sub"
    position: string | null
    goals: number
    assists: number
    apps: number
  }[]
}

interface FormEntry {
  won: boolean
  drew: boolean
  is_home: boolean
  opponent_name: string
  date: string
  home_score: number
  away_score: number
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let start = 0
    const duration = 800
    const steps = 30
    const increment = value / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: "warning" | "default" | "success"; label: string }> = {
    captain: { variant: "warning", label: "CAPTAIN" },
    manager: { variant: "default", label: "MANAGER" },
    player: { variant: "success", label: "PLAYER" },
    sub: { variant: "default", label: "SUB" },
  }
  const c = config[role] || { variant: "default" as const, label: role.toUpperCase() }
  return (
    <Badge variant={role === "sub" ? "outline" : c.variant === "default" ? "default" : c.variant}>
      {c.label}
    </Badge>
  )
}

function FormPill({ entry }: { entry: FormEntry }) {
  const color = entry.drew
    ? "bg-accent-gold/20 text-accent-gold border-accent-gold/30"
    : entry.won
      ? "bg-accent-green/20 text-accent-green border-accent-green/30"
      : "bg-accent-red/20 text-accent-red border-accent-red/30"
  const label = entry.drew ? "D" : entry.won ? "W" : "L"
  return (
    <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border", color)}>
      {label}
    </span>
  )
}

export default function ClubPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()

  const { data: clubData, isLoading, error } = useQuery<ClubData>({
    queryKey: ["club", id],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${id}`)
      if (!res.ok) throw new Error("Club not found")
      return res.json()
    },
  })

  const { data: formData, isLoading: formLoading } = useQuery<{ form: FormEntry[] }>({
    queryKey: ["club-form", id],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${id}/form`)
      return res.json()
    },
  })

  const club = clubData?.club
  const stats = clubData?.stats
  const members = clubData?.members
  const form = formData?.form ?? []

  const isCaptain = members?.some((m) => m.user_id === user?.id && m.role === "captain")

  if (isLoading) return <ClubSkeleton />
  if (error || !club) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Swords size={48} className="text-text-muted" />
            <h2 className="text-xl font-bold">Club not found</h2>
            <p className="text-sm text-text-muted">This club doesn&apos;t exist or has been removed.</p>
            <Link href="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </PageTransition>
      </AppLayout>
    )
  }

  const gd = stats ? stats.goals_for - stats.goals_against : 0
  const winRate = stats && stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer>
          {/* Hero Banner */}
          <StaggerItem>
            <div
              className="relative rounded-2xl overflow-hidden mb-8"
              style={{ background: `linear-gradient(135deg, ${club.primary_color}22, ${club.primary_color}44)` }}
            >
              <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(ellipse at 30% 50%, ${club.primary_color}44 0%, transparent 70%)` }}
              />
              <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl"
                    style={{ backgroundColor: club.primary_color }}
                  >
                    {club.short_name || club.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-black text-white">{club.name}</h1>
                      <Badge variant={club.visibility === "public" ? "success" : "warning"}>
                        {club.visibility}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary max-w-lg">
                      {club.description || "No description set."}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Created {formatDate(club.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {members?.length ?? 0}/{club.max_members} members
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 self-end md:self-center">
                  {isCaptain && (
                    <Link href={`/clubs/${id}/settings`}>
                      <Button variant="secondary" size="sm">
                        <Settings size={16} /> Settings
                      </Button>
                    </Link>
                  )}
                  <Link href="/join">
                    <Button variant="glow" size="sm">
                      <Plus size={16} /> Join
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </StaggerItem>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats & Squad - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Season Record */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Trophy size={16} className="text-accent-gold" />
                      Season Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!stats ? (
                      <p className="text-sm text-text-muted py-4 text-center">No match data yet.</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                          {[
                            { label: "Played", value: stats.played, color: "text-white" },
                            { label: "Wins", value: stats.wins, color: "text-accent-green" },
                            { label: "Draws", value: stats.draws, color: "text-accent-gold" },
                            { label: "Losses", value: stats.losses, color: "text-accent-red" },
                            { label: "Goals For", value: stats.goals_for, color: "text-accent-green" },
                            { label: "Goals Against", value: stats.goals_against, color: "text-accent-red" },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="bg-white/5 rounded-xl p-3 text-center"
                            >
                              <div className={cn("text-xl md:text-2xl font-black", s.color)}>
                                <AnimatedNumber value={s.value} />
                              </div>
                              <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">
                                {s.label}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-muted pt-3 border-t border-white/5">
                          <span>
                            Goal Difference:{" "}
                            <span className={cn("font-bold", gd > 0 ? "text-accent-green" : gd < 0 ? "text-accent-red" : "text-white")}>
                              {gd > 0 ? "+" : ""}{gd}
                            </span>
                          </span>
                          <span>
                            Win Rate: <span className="font-bold text-white">{winRate}%</span>
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Squad */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Users size={16} className="text-accent-blue" />
                      Squad ({members?.length ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!members || members.length === 0 ? (
                      <div className="text-center py-8">
                        <Users size={32} className="mx-auto text-text-muted mb-2" />
                        <p className="text-sm text-text-muted">No players in this club yet.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {members.map((member, i) => {
                          const rating = overallRating(member.goals, member.assists, member.apps)
                          const rarity = rarityFromRating(rating)
                          return (
                            <Link key={member.id} href={`/profile/${member.user_id}`}>
                              <Card
                                variant="player"
                                hover
                                padding="sm"
                                glow={member.role === "captain"}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    name={member.global_name || member.username}
                                    src={member.avatar}
                                    size="md"
                                    ring={member.role === "captain"}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-white truncate">
                                        {member.global_name || member.username}
                                      </span>
                                      <RoleBadge role={member.role} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {member.position && (
                                        <Badge variant="outline" className="text-[10px]">
                                          {member.position}
                                        </Badge>
                                      )}
                                      <Badge variant="rarity" rarity={rarity} className="text-[10px]">
                                        {rating}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right text-[11px] text-text-muted leading-relaxed">
                                    <div>{member.apps} apps</div>
                                    <div className="text-accent-green">{member.goals}g</div>
                                    <div className="text-accent-blue">{member.assists}a</div>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Form Guide */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Shield size={16} className="text-accent-green" />
                      Form Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">No recent matches.</p>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-center mb-4">
                        {form.map((entry, i) => (
                          <FormPill key={i} entry={entry} />
                        ))}
                      </div>
                    )}
                    <Separator className="my-3" />
                    <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-accent-green/30 border border-accent-green/50" /> W
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-accent-gold/30 border border-accent-gold/50" /> D
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-accent-red/30 border border-accent-red/50" /> L
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Recent Matches Timeline */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Swords size={16} className="text-accent-purple" />
                      Recent Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.length === 0 ? (
                      <div className="text-center py-8">
                        <Swords size={28} className="mx-auto text-text-muted mb-2" />
                        <p className="text-sm text-text-muted">No matches played yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.map((entry, i) => {
                          const resultColor = entry.drew
                            ? "text-accent-gold border-accent-gold/30"
                            : entry.won
                              ? "text-accent-green border-accent-green/30"
                              : "text-accent-red border-accent-red/30"
                          const resultLabel = entry.drew ? "D" : entry.won ? "W" : "L"
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0",
                                  resultColor
                                )}
                              >
                                {resultLabel}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className={entry.is_home ? "font-bold text-white" : "text-text-muted"}>
                                    {club.short_name || club.name.slice(0, 3).toUpperCase()}
                                  </span>
                                  <span className="font-mono font-bold text-white text-xs">
                                    {entry.home_score} - {entry.away_score}
                                  </span>
                                  <span className={!entry.is_home ? "font-bold text-white" : "text-text-muted"}>
                                    {entry.opponent_name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-text-muted">
                                  {formatDate(entry.date)}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Head-to-Head (placeholder) */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Swords size={16} className="text-accent-cyan" />
                      Head-to-Head
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <Swords size={28} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm text-text-muted">No rival club set yet.</p>
                      <p className="text-xs text-text-muted mt-1">Head-to-head stats will appear once a rivalry is established.</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}

function ClubSkeleton() {
  return (
    <AppLayout>
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
