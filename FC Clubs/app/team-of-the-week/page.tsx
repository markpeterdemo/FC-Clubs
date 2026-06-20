"use client"

import { useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Swords, Goal, Users } from "lucide-react"

interface Leader {
  id: string
  name: string
  global_name: string | null
  avatar: string | null
  discord_id: string
  value: number
  club_name: string
  club_color: string
}

interface TOTWPlayer {
  position: string
  player: Leader
  statLabel: string
  statValue: number
}

interface SlotStyle {
  gridArea: string
  label: string
}

const formationSlots: SlotStyle[] = [
  { gridArea: "gk", label: "GK" },
  { gridArea: "lb", label: "LB" },
  { gridArea: "cb1", label: "CB" },
  { gridArea: "cb2", label: "CB" },
  { gridArea: "rb", label: "RB" },
  { gridArea: "cdm", label: "CDM" },
  { gridArea: "cm", label: "CM" },
  { gridArea: "cam", label: "CAM" },
  { gridArea: "lw", label: "LW" },
  { gridArea: "st", label: "ST" },
  { gridArea: "rw", label: "RW" },
]

function assignTeam(goalLeaders: Leader[], assistLeaders: Leader[]): TOTWPlayer[] {
  const pool = new Map<string, { player: Leader; goals: number; assists: number }>()

  for (const p of goalLeaders) {
    pool.set(p.id, { player: p, goals: p.value, assists: 0 })
  }
  for (const p of assistLeaders) {
    const existing = pool.get(p.id)
    if (existing) {
      existing.assists = p.value
    } else {
      pool.set(p.id, { player: p, goals: 0, assists: p.value })
    }
  }

  const all = Array.from(pool.values())
  if (all.length === 0) return []

  const byGoals = [...all].sort((a, b) => b.goals - a.goals)
  const byAssists = [...all].sort((a, b) => b.assists - a.assists)
  const used = new Set<string>()
  const team: TOTWPlayer[] = []

  const pick = (position: string, source: typeof byGoals, stat: "goals" | "assists") => {
    for (const entry of source) {
      if (!used.has(entry.player.id)) {
        used.add(entry.player.id)
        team.push({
          position,
          player: entry.player,
          statLabel: stat === "goals" ? "Goals" : "Assists",
          statValue: stat === "goals" ? entry.goals : entry.assists,
        })
        return
      }
    }
    team.push({
      position,
      player: { id: "-", name: "TBD", global_name: null, avatar: null, discord_id: "", value: 0, club_name: "-", club_color: "#555" },
      statLabel: "",
      statValue: 0,
    })
  }

  pick("ST", byGoals, "goals")
  pick("LW", byGoals, "goals")
  pick("RW", byGoals, "goals")
  pick("CAM", byAssists, "assists")
  pick("CM", byAssists, "assists")
  pick("CDM", byAssists, "assists")

  const remaining = all.filter((e) => !used.has(e.player.id))
  const byScore = [...remaining].sort(
    (a, b) => b.goals + b.assists - (a.goals + a.assists),
  )

  for (const pos of ["LB", "CB", "CB", "RB", "GK"]) {
    pick(pos, byScore, "goals")
  }

  return team
}

function FormationSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto aspect-[3/4] sm:aspect-[4/3] grid gap-3"
      style={{
        gridTemplateAreas: `
          ". . . gk . . ."
          "lb . cb1 cb2 . rb ."
          ". cdm . . . cm ."
          "lw . cam . . rw ."
          ". . st . . . ."
        `,
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr 1fr 1fr",
      }}
    >
      {formationSlots.map((slot) => (
        <div
          key={slot.gridArea}
          className="flex flex-col items-center justify-center gap-2"
          style={{ gridArea: slot.gridArea }}
        >
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-16 h-3 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function TeamOfTheWeekPage() {
  const goalsQuery = useQuery({
    queryKey: ["leaders", "goals"],
    queryFn: async () => {
      const res = await fetch("/api/players/leaders?stat=goals")
      if (!res.ok) throw new Error("Failed to fetch goal leaders")
      return res.json() as Promise<{ leaders: Leader[] }>
    },
  })

  const assistsQuery = useQuery({
    queryKey: ["leaders", "assists"],
    queryFn: async () => {
      const res = await fetch("/api/players/leaders?stat=assists")
      if (!res.ok) throw new Error("Failed to fetch assist leaders")
      return res.json() as Promise<{ leaders: Leader[] }>
    },
  })

  const team = useMemo(() => {
    if (!goalsQuery.data?.leaders || !assistsQuery.data?.leaders) return []
    return assignTeam(goalsQuery.data.leaders, assistsQuery.data.leaders)
  }, [goalsQuery.data, assistsQuery.data])

  const isLoading = goalsQuery.isLoading || assistsQuery.isLoading
  const error = goalsQuery.error || assistsQuery.error

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="space-y-6">
          <StaggerItem>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-black">Team of the Week</h1>
                <p className="text-sm text-text-muted mt-1">
                  The best XI based on matchday performances.
                </p>
              </div>
              <Badge variant="warning" className="ml-auto shrink-0">
                <Swords size={12} />
                Matchday 1
              </Badge>
            </div>
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <FormationSkeleton />
            ) : error ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <p className="text-accent-red">Failed to load team data.</p>
              </Card>
            ) : team.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Users size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">Not enough data to form a team yet.</p>
              </Card>
            ) : (
              <div
                className="w-full max-w-4xl mx-auto aspect-[3/5] sm:aspect-[4/3] grid gap-2 sm:gap-3"
                style={{
                  gridTemplateAreas: `
                    ". . . gk . . ."
                    "lb . cb1 cb2 . rb ."
                    ". cdm . . . cm ."
                    "lw . cam . . rw ."
                    ". . st . . . ."
                  `,
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  gridTemplateRows: "1fr 1fr 1fr 1fr 1fr",
                }}
              >
                {formationSlots.map((slot, i) => {
                  const totw = team.find((t) => t.position === slot.label)
                  if (!totw) return null
                  const isDef = ["GK", "LB", "CB", "CB", "RB"].includes(slot.label)
                  return (
                    <motion.div
                      key={slot.gridArea}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="flex flex-col items-center justify-center gap-1.5"
                      style={{ gridArea: slot.gridArea }}
                    >
                      <div className="relative">
                        <Avatar
                          name={totw.player.global_name || totw.player.name}
                          src={totw.player.avatar ?? undefined}
                          size="lg"
                          className="shadow-lg"
                          ring
                        />
                        <span
                          className={cn(
                            "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                            isDef
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-accent-green/20 text-accent-green border-accent-green/30",
                          )}
                        >
                          {slot.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-white text-center leading-tight max-w-[80px] truncate">
                        {totw.player.global_name || totw.player.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: totw.player.club_color }}
                        />
                        <span className="text-[10px] text-text-muted truncate max-w-[60px]">
                          {totw.player.club_name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-accent-gold">
                        {totw.statLabel === "Goals" ? (
                          <span className="flex items-center gap-0.5">
                            <Goal size={10} /> {totw.statValue}
                          </span>
                        ) : totw.statLabel === "Assists" ? (
                          <span className="flex items-center gap-0.5">
                            <Users size={10} /> {totw.statValue}
                          </span>
                        ) : null}
                      </span>
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
