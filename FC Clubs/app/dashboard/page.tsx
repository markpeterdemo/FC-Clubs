"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth-context"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CircularProgress, Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Users,
  Swords,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  ChevronRight,
  Plus,
  Shield,
  Activity,
} from "lucide-react"

interface ClubData {
  id: string
  name: string
  short_name: string
  primary_color: string
  description: string
  visibility: string
  member_count: number
  max_members: number
  logo_url: string | null
  member: {
    role: string
    position: string | null
  }
}

interface StatsData {
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  points: number
  goal_diff: number
}

interface UpcomingMatch {
  id: string
  home_club_id: string
  away_club_id: string
  home_score: number | null
  away_score: number | null
  match_date: string
  status: string
  away_short: string | null
}

interface MyClubResponse {
  club: ClubData | null
  stats: StatsData | null
  upcomingMatch: UpcomingMatch | null
}

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center"
    >
      <motion.span
        className="text-2xl font-black tabular-nums text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.span>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </motion.div>
  )
}

const statCards = [
  { key: "played", label: "Played", icon: Activity },
  { key: "wins", label: "Wins", icon: Trophy },
  { key: "draws", label: "Draws", icon: TrendingUp },
  { key: "losses", label: "Losses", icon: Target },
  { key: "goals_for", label: "Goals For", icon: Swords },
  { key: "goals_against", label: "Goals Against", icon: Shield },
] as const

const quickLinks = [
  { href: "/standings", label: "Standings", icon: Trophy, desc: "View league table" },
  { href: "/players", label: "Players", icon: Users, desc: "Browse player cards" },
  { href: "/join", label: "Transfers", icon: Swords, desc: "Find new players" },
]

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  const { data: myClub, isLoading: clubLoading } = useQuery<MyClubResponse>({
    queryKey: ["my-club"],
    queryFn: async () => {
      const res = await fetch("/api/clubs/my")
      return res.json()
    },
    enabled: !!user,
  })

  const { data: formData } = useQuery({
    queryKey: ["standings-form"],
    queryFn: async () => {
      const res = await fetch("/api/standings/form")
      return res.json() as Promise<{ formMap: Record<string, { won: boolean; drew: boolean; is_home: boolean }[]> }>
    },
    enabled: !!user && !!myClub?.club,
  })

  if (authLoading || !user) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  const club = myClub?.club
  const stats = myClub?.stats
  const upcoming = myClub?.upcomingMatch
  const clubForm = formData?.formMap?.[club?.id ?? ""] ?? []

  if (!club || !stats) {
    return (
      <AppLayout>
        <PageTransition>
          <StaggerContainer className="max-w-2xl mx-auto text-center py-20">
            <StaggerItem>
              <div className="w-20 h-20 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-accent-green" />
              </div>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-2xl font-black mb-2">No Club Yet</h1>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                You haven&apos;t joined or created a club. Join an existing club or create your own to get started.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-center justify-center gap-3">
                <Link href="/join">
                  <Button variant="glow" size="lg">
                    <Plus size={18} />
                    Join a Club
                  </Button>
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </PageTransition>
      </AppLayout>
    )
  }

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0
  const isUserHome = upcoming ? upcoming.home_club_id === club.id : false
  const opponentName = isUserHome ? upcoming?.away_short : club.short_name

  return (
    <AppLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Club Hero */}
          <StaggerContainer>
            <StaggerItem>
              <Card
                variant="gradient"
                padding="lg"
                className="relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${club.primary_color} 0%, transparent 100%)`,
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                      style={{ backgroundColor: club.primary_color }}
                    >
                      {club.short_name || club.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-xl font-black">{club.name}</h1>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {club.member_count}/{club.max_members}
                        </span>
                        <Badge variant={club.visibility === "public" ? "success" : "warning"}>
                          {club.visibility}
                        </Badge>
                        <Badge variant="default">{club.member.role}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/standings">
                      <Button variant="secondary" size="sm">
                        Standings
                      </Button>
                    </Link>
                    <Link href="/join">
                      <Button variant="secondary" size="sm">
                        Transfer
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </StaggerItem>

            {/* Stat Cards */}
            <StaggerItem>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {statCards.map(({ key, label, icon: Icon }) => (
                  <Card key={key} variant="glass" padding="md" className="text-center">
                    <Icon size={16} className="text-text-muted mx-auto mb-1.5" />
                    <AnimatedCounter value={stats[key as keyof StatsData] as number} label={label} />
                  </Card>
                ))}
              </div>
            </StaggerItem>

            {/* Win Rate + Form Guide + Upcoming Match */}
            <StaggerItem>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Win Rate */}
                <Card variant="glass" padding="md" className="flex flex-col items-center justify-center py-6">
                  <CircularProgress value={winRate} size={88} strokeWidth={7} label="Win Rate" />
                </Card>

                {/* Form Guide */}
                <Card variant="glass" padding="md">
                  <CardHeader>
                    <CardTitle>Recent Form</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clubForm.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">No matches played yet</p>
                    ) : (
                      <div className="flex items-center gap-2 justify-center py-2">
                        {clubForm.map((f, i) => {
                          let variant: "success" | "warning" | "danger" = "danger"
                          let label = "L"
                          if (f.won) {
                            variant = "success"
                            label = "W"
                          } else if (f.drew) {
                            variant = "warning"
                            label = "D"
                          }
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.08 }}
                            >
                              <Badge variant={variant} className="!px-3 !py-1.5 !text-base !font-black">
                                {label}
                              </Badge>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Match */}
                <Card variant="glass" padding="md">
                  <CardHeader>
                    <CardTitle>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Up Next
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcoming ? (
                      <div className="text-center py-2">
                        <p className="text-sm text-text-muted mb-2">
                          {new Date(upcoming.match_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex items-center justify-center gap-3 text-sm font-bold">
                          <span>{club.short_name}</span>
                          <span className="text-text-muted text-xs">vs</span>
                          <span>{opponentName || "TBD"}</span>
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {isUserHome ? "Home" : "Away"}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted text-center py-4">No upcoming matches</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </StaggerItem>

            {/* Quick Links */}
            <StaggerItem>
              <h2 className="text-lg font-bold mt-2 mb-3">Quick Links</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.href} href={link.href}>
                      <Card variant="glass" hover padding="md" className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon size={18} className="text-accent-green" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{link.label}</p>
                            <p className="text-xs text-text-muted">{link.desc}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-text-muted group-hover:translate-x-0.5 transition-transform" />
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
