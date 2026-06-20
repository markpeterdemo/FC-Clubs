"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Search, Goal, Users, Footprints, Trophy } from "lucide-react"

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

const statTabs = [
  { id: "goals", label: "Top Scorers", icon: <Goal size={16} /> },
  { id: "assists", label: "Playmakers", icon: <Users size={16} /> },
  { id: "apps", label: "Iron Men", icon: <Footprints size={16} /> },
]

const medalEmojis = ["🥇", "🥈", "🥉"]
const barGradients = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-orange-700",
]

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState("goals")
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaders", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/players/leaders?stat=${activeTab}`)
      if (!res.ok) throw new Error("Failed to fetch leaders")
      return res.json() as Promise<{ leaders: Leader[] }>
    },
  })

  const filtered = useMemo(() => {
    if (!data?.leaders) return []
    if (!search) return data.leaders
    const q = search.toLowerCase()
    return data.leaders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.global_name?.toLowerCase().includes(q) ||
        p.club_name.toLowerCase().includes(q),
    )
  }, [data, search])

  const maxValue = useMemo(() => {
    if (!filtered.length) return 1
    return Math.max(...filtered.map((p) => p.value))
  }, [filtered])

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="space-y-6">
          <StaggerItem>
            <div>
              <h1 className="text-2xl font-black">Stats Center</h1>
              <p className="text-sm text-text-muted mt-1">
                League leaderboards across all stat categories.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <Tabs tabs={statTabs} active={activeTab} onChange={setActiveTab} />
              <Input
                icon={<Search size={16} />}
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <p className="text-accent-red">Failed to load leaderboard.</p>
              </Card>
            ) : filtered.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Trophy size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">
                  {search ? "No players match your search." : "No leaders found for this stat."}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((player, i) => {
                  const pct = (player.value / maxValue) * 100
                  const isTop3 = i < 3
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                    >
                      <Card
                        variant="glass"
                        padding="sm"
                        className={cn(
                          "flex items-center gap-3",
                          isTop3 && "border-accent-gold/20 bg-accent-gold/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "w-8 text-center text-sm font-bold shrink-0",
                            isTop3 ? "text-lg" : "text-text-muted",
                          )}
                        >
                          {isTop3 ? medalEmojis[i] : `#${i + 1}`}
                        </span>

                        <Avatar
                          name={player.global_name || player.name}
                          src={player.avatar ?? undefined}
                          size="sm"
                        />

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white truncate block">
                            {player.global_name || player.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: player.club_color }}
                            />
                            <span className="text-xs text-text-muted truncate">
                              {player.club_name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 sm:w-32 md:w-48 h-2.5 rounded-full bg-white/5 overflow-hidden hidden sm:block">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r",
                                isTop3 ? barGradients[i] : "from-accent-green to-emerald-400",
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-lg font-black tabular-nums w-12 text-right",
                              isTop3 ? "text-accent-gold" : "text-white",
                            )}
                          >
                            {player.value}
                          </span>
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
