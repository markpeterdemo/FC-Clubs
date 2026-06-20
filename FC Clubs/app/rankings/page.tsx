"use client"

import { useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react"

interface Standing {
  club_id: string
  name: string
  short_name: string
  primary_color: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  points: number
  gd: number
}

interface FormData {
  formMap: Record<string, string[]>
}

type FormResult = "W" | "D" | "L"

interface PowerRanking {
  club: Standing
  powerScore: number
  formScore: number
  form: string[]
  tablePos: number
  rankPos: number
  movement: "up" | "down" | "same"
}

const formValue: Record<FormResult, number> = { W: 3, D: 1, L: 0 }

function calcPowerRanking(club: Standing, form: string[]): number {
  const recent = form.slice(-5)
  const formScore = recent.reduce((sum, r) => sum + (formValue[r as FormResult] || 0), 0)
  return (
    club.points * 0.4 +
    club.goals_for * 0.15 +
    formScore * 0.3 -
    club.goals_against * 0.15
  )
}

const podiumColors = [
  "from-yellow-400/20 to-amber-500/10 border-yellow-500/30",
  "from-gray-300/20 to-gray-400/10 border-gray-400/30",
  "from-amber-600/20 to-orange-700/10 border-amber-600/30",
]

const rankStyles = [
  "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]",
  "text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.3)]",
  "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]",
]

export default function RankingsPage() {
  const standingsQuery = useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      const res = await fetch("/api/standings")
      if (!res.ok) throw new Error("Failed to fetch standings")
      return res.json() as Promise<{ standings: Standing[] }>
    },
  })

  const formQuery = useQuery({
    queryKey: ["standings-form"],
    queryFn: async () => {
      const res = await fetch("/api/standings/form")
      if (!res.ok) throw new Error("Failed to fetch form data")
      return res.json() as Promise<FormData>
    },
  })

  const rankings = useMemo<PowerRanking[]>(() => {
    const standings = standingsQuery.data?.standings
    const formMap = formQuery.data?.formMap
    if (!standings || !formMap) return []

    const tableSorted = [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.goals_for - a.goals_for
    })

    const tablePosMap = new Map<string, number>()
    tableSorted.forEach((s, i) => tablePosMap.set(s.club_id, i + 1))

    const scored = standings.map((club) => {
      const form = formMap[club.club_id] || []
      const powerScore = calcPowerRanking(club, form)
      const recent = form.slice(-5)
      const formScore = recent.reduce((sum, r) => sum + (formValue[r as FormResult] || 0), 0)
      return { club, powerScore, formScore, form }
    })

    scored.sort((a, b) => b.powerScore - a.powerScore)

    return scored.map((item, i) => ({
      ...item,
      tablePos: tablePosMap.get(item.club.club_id) || i + 1,
      rankPos: i + 1,
      movement: (() => {
        const tp = tablePosMap.get(item.club.club_id) || i + 1
        if (tp > i + 1) return "up" as const
        if (tp < i + 1) return "down" as const
        return "same" as const
      })(),
    }))
  }, [standingsQuery.data, formQuery.data])

  const isLoading = standingsQuery.isLoading || formQuery.isLoading
  const error = standingsQuery.error || formQuery.error

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="space-y-6">
          <StaggerItem>
            <div>
              <h1 className="text-2xl font-black">Power Rankings</h1>
              <p className="text-sm text-text-muted mt-1">
                Clubs ranked by weighted performance metrics and recent form.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <p className="text-accent-red">Failed to load power rankings.</p>
              </Card>
            ) : rankings.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Trophy size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">No ranking data available yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {rankings.map((item, i) => {
                  const isTop3 = i < 3
                  return (
                    <motion.div
                      key={item.club.club_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <Card
                        variant="glass"
                        padding="md"
                        className={cn(
                          "flex items-center gap-4",
                          isTop3 && podiumColors[i],
                        )}
                      >
                        {/* Position */}
                        <div className="shrink-0 w-10 text-center">
                          <span
                            className={cn(
                              "text-xl font-black tabular-nums",
                              isTop3 ? rankStyles[i] : "text-text-muted",
                            )}
                          >
                            #{item.rankPos}
                          </span>
                        </div>

                        {/* Club badge */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0 shadow-lg"
                          style={{ backgroundColor: item.club.primary_color }}
                        >
                          {item.club.short_name || item.club.name.slice(0, 3).toUpperCase()}
                        </div>

                        {/* Club info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white truncate">{item.club.name}</h3>
                            {isTop3 && (
                              <span className="text-sm shrink-0">
                                {["🥇", "🥈", "🥉"][i]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-text-muted">
                              {item.club.points} pts
                            </span>
                            <span className="text-xs text-text-muted">
                              GD: {item.club.gd > 0 ? "+" : ""}{item.club.gd}
                            </span>
                          </div>
                        </div>

                        {/* Form guide */}
                        <div className="hidden sm:flex items-center gap-1">
                          {item.form.slice(-5).map((r, fi) => (
                            <span
                              key={fi}
                              className={cn(
                                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
                                r === "W" && "bg-accent-green/20 text-accent-green",
                                r === "D" && "bg-accent-gold/20 text-accent-gold",
                                r === "L" && "bg-accent-red/20 text-accent-red",
                              )}
                            >
                              {r}
                            </span>
                          ))}
                        </div>

                        {/* Power score & movement */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-bold text-white tabular-nums">
                              {item.powerScore.toFixed(1)}
                            </div>
                            <div className="text-[10px] text-text-muted">score</div>
                          </div>
                          <div className="w-8 flex justify-center">
                            {item.movement === "up" ? (
                              <TrendingUp size={18} className="text-accent-green" />
                            ) : item.movement === "down" ? (
                              <TrendingDown size={18} className="text-accent-red" />
                            ) : (
                              <Minus size={18} className="text-text-muted" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
