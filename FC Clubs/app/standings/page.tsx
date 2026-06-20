"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Trophy, Medal } from "lucide-react"

interface StandingRow {
  id: string
  name: string
  short_name: string
  primary_color: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_diff: number
  points: number
  member_count: number
}

interface FormEntry {
  won: boolean
  drew: boolean
  home_score: number
  away_score: number
  is_home: boolean
}

function FormPill({ entry }: { entry: FormEntry }) {
  let variant: "success" | "warning" | "danger" = "danger"
  let label = "L"
  if (entry.won) {
    variant = "success"
    label = "W"
  } else if (entry.drew) {
    variant = "warning"
    label = "D"
  }
  return (
    <Badge variant={variant} className="!px-2 !py-0.5 !text-xs !font-black min-w-[28px] text-center">
      {label}
    </Badge>
  )
}

function RowHighlight({ position, total }: { position: number; total: number }) {
  if (position === 1) return <Trophy size={14} className="text-accent-gold" />
  if (position === 2) return <Medal size={14} className="text-text-muted" />
  if (position === 3) return <Medal size={14} className="text-amber-700" />
  return null
}

function getRowBorder(position: number, total: number) {
  if (position <= 3) return "border-l-accent-gold"
  if (position <= 4) return "border-l-accent-green"
  if (position > total - 2) return "border-l-accent-red"
  return "border-l-transparent"
}

function getRowGlow(position: number, total: number) {
  if (position === 1) return "shadow-[inset_0_0_20px_rgba(245,158,11,0.06)]"
  if (position <= 4) return "shadow-[inset_0_0_20px_rgba(34,197,94,0.04)]"
  return ""
}

export default function StandingsPage() {
  const { data: standingsData, isLoading: standingsLoading } = useQuery<{ standings: StandingRow[]; season: string }>({
    queryKey: ["standings"],
    queryFn: async () => {
      const res = await fetch("/api/standings")
      return res.json()
    },
  })

  const { data: formData, isLoading: formLoading } = useQuery<{ formMap: Record<string, FormEntry[]> }>({
    queryKey: ["standings-form"],
    queryFn: async () => {
      const res = await fetch("/api/standings/form")
      return res.json()
    },
  })

  const standings = standingsData?.standings ?? []
  const formMap = formData?.formMap ?? {}
  const loading = standingsLoading || formLoading
  const total = standings.length

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black">League Standings</h1>
                {standingsData?.season && (
                  <p className="text-sm text-text-muted mt-0.5">{standingsData.season} Season</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
                <span>UCL</span>
                <div className="w-2.5 h-2.5 rounded-full bg-accent-red ml-2" />
                <span>Relegation</span>
              </div>
            </div>
          </StaggerItem>

          {loading ? (
            <StaggerItem>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </StaggerItem>
          ) : standings.length === 0 ? (
            <StaggerItem>
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Trophy size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">No standings data yet</p>
              </Card>
            </StaggerItem>
          ) : (
            <>
              {/* Desktop Table */}
              <StaggerItem className="hidden md:block">
                <Card variant="glass" padding="none" className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-text-muted font-semibold uppercase tracking-wider">
                        <th className="text-left py-3 pl-4 w-12">#</th>
                        <th className="text-left py-3 pr-4">Club</th>
                        <th className="text-center py-3 px-2 w-12">P</th>
                        <th className="text-center py-3 px-2 w-10">W</th>
                        <th className="text-center py-3 px-2 w-10">D</th>
                        <th className="text-center py-3 px-2 w-10">L</th>
                        <th className="text-center py-3 px-2 w-14">GF</th>
                        <th className="text-center py-3 px-2 w-14">GA</th>
                        <th className="text-center py-3 px-2 w-14">GD</th>
                        <th className="text-center py-3 px-2 w-14">Pts</th>
                        <th className="text-center py-3 pr-4 w-32">Form</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, i) => {
                        const position = i + 1
                        const form = formMap[row.id] ?? []
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                            className={cn(
                              "group border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02] cursor-default",
                              getRowBorder(position, total),
                              "border-l-2",
                              getRowGlow(position, total)
                            )}
                          >
                            <td className="py-3 pl-4">
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "text-sm font-bold tabular-nums w-6",
                                  position <= 3 ? "text-accent-gold" : "text-text-muted"
                                )}>
                                  {position}
                                </span>
                                <RowHighlight position={position} total={total} />
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: row.primary_color }}
                                />
                                <span className="text-sm font-bold text-white group-hover:text-accent-green transition-colors">
                                  {row.name}
                                </span>
                                {position <= 4 && (
                                  <Badge variant="success" className="!px-1.5 !py-0 !text-[10px]">
                                    {position <= 3 ? "EL" : "UCL"}
                                  </Badge>
                                )}
                                {position > total - 2 && (
                                  <Badge variant="danger" className="!px-1.5 !py-0 !text-[10px]">
                                    REL
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3 px-2 text-sm font-bold tabular-nums">{row.played}</td>
                            <td className="text-center py-3 px-2 text-sm text-accent-green font-semibold tabular-nums">{row.wins}</td>
                            <td className="text-center py-3 px-2 text-sm text-accent-gold font-semibold tabular-nums">{row.draws}</td>
                            <td className="text-center py-3 px-2 text-sm text-accent-red font-semibold tabular-nums">{row.losses}</td>
                            <td className="text-center py-3 px-2 text-sm font-semibold tabular-nums">{row.goals_for}</td>
                            <td className="text-center py-3 px-2 text-sm font-semibold tabular-nums">{row.goals_against}</td>
                            <td className={cn(
                              "text-center py-3 px-2 text-sm font-bold tabular-nums",
                              row.goal_diff > 0 && "text-accent-green",
                              row.goal_diff < 0 && "text-accent-red",
                            )}>
                              {row.goal_diff > 0 ? "+" : ""}{row.goal_diff}
                            </td>
                            <td className="text-center py-3 px-2 text-sm font-black tabular-nums">{row.points}</td>
                            <td className="text-center py-3 pr-4">
                              <div className="flex items-center justify-center gap-1">
                                {form.map((entry, fi) => (
                                  <FormPill key={fi} entry={entry} />
                                ))}
                                {form.length === 0 && (
                                  <span className="text-[10px] text-text-muted">—</span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Card>
              </StaggerItem>

              {/* Mobile Cards */}
              <StaggerItem className="md:hidden space-y-2">
                {standings.map((row, i) => {
                  const position = i + 1
                  const form = formMap[row.id] ?? []
                  return (
                    <StaggerItem key={row.id}>
                      <Card
                        variant="glass"
                        padding="md"
                        className={cn(
                          "border-l-2",
                          getRowBorder(position, total),
                          getRowGlow(position, total)
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5 min-w-[32px]">
                            <span className={cn(
                              "text-sm font-bold tabular-nums",
                              position <= 3 ? "text-accent-gold" : "text-text-muted"
                            )}>
                              {position}
                            </span>
                            <RowHighlight position={position} total={total} />
                          </div>
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: row.primary_color }}
                          />
                          <span className="text-sm font-bold flex-1">{row.name}</span>
                          <span className="text-lg font-black tabular-nums">{row.points}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>P:{row.played}</span>
                          <span className="text-accent-green">W:{row.wins}</span>
                          <span className="text-accent-gold">D:{row.draws}</span>
                          <span className="text-accent-red">L:{row.losses}</span>
                          <span>GF:{row.goals_for}</span>
                          <span>GA:{row.goals_against}</span>
                          <span className={cn(
                            "font-bold",
                            row.goal_diff > 0 && "text-accent-green",
                            row.goal_diff < 0 && "text-accent-red",
                          )}>
                            GD:{row.goal_diff > 0 ? "+" : ""}{row.goal_diff}
                          </span>
                        </div>

                        {form.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                            {form.map((entry, fi) => (
                              <FormPill key={fi} entry={entry} />
                            ))}
                          </div>
                        )}
                      </Card>
                    </StaggerItem>
                  )
                })}
              </StaggerItem>
            </>
          )}
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
