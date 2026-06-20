"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { overallRating, rarityFromRating } from "@/lib/utils"
import { Search, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const POSITIONS = [
  "GK", "CB", "LB", "RB",
  "CDM", "CM", "CAM",
  "LM", "RM", "LW", "RW", "ST",
] as const

interface PlayerData {
  user_id: string
  discord_id: string
  username: string
  global_name: string | null
  avatar: string | null
  position: string | null
  role: string
  club_id: string
  club_name: string
  club_short_name: string | null
  club_color: string
  club_logo: string | null
  apps: number
  goals: number
  assists: number
}

interface PlayersResponse {
  players: PlayerData[]
}

const rarityConfig = {
  common: { color: "text-white/40", bg: "bg-white/5" },
  rare: { color: "text-blue-400", bg: "bg-blue-500/10" },
  epic: { color: "text-purple-400", bg: "bg-purple-500/10" },
  legendary: { color: "text-amber-400", bg: "bg-amber-500/10" },
}

function PlayerCardSkeleton() {
  return (
    <Card variant="glass" padding="md" className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-3/4" />
    </Card>
  )
}

export default function PlayersPage() {
  const [search, setSearch] = useState("")
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])

  const { data, isLoading } = useQuery<PlayersResponse>({
    queryKey: ["players", search, selectedPositions],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (selectedPositions.length > 0) params.set("positions", selectedPositions.join(","))
      const res = await fetch(`/api/players?${params}`)
      return res.json()
    },
  })

  const players = data?.players ?? []

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    )
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedPositions([])
  }

  const hasFilters = search || selectedPositions.length > 0

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="mb-6">
              <h1 className="text-2xl font-black">Players</h1>
              <p className="text-sm text-text-muted mt-0.5">Browse all players in the league</p>
            </div>
          </StaggerItem>

          {/* Search + Filters */}
          <StaggerItem>
            <div className="space-y-3 mb-6">
              <Input
                icon={<Search size={16} />}
                placeholder="Search players or clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="flex flex-wrap gap-1.5">
                {POSITIONS.map((pos) => {
                  const active = selectedPositions.includes(pos)
                  return (
                    <button
                      key={pos}
                      onClick={() => togglePosition(pos)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200",
                        active
                          ? "bg-accent-green text-black"
                          : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-secondary"
                      )}
                    >
                      {pos}
                    </button>
                  )
                })}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-accent-red hover:bg-accent-red/10 transition-colors flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </StaggerItem>

          {/* Content */}
          <StaggerItem>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <PlayerCardSkeleton key={i} />
                ))}
              </div>
            ) : players.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Users size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted font-medium">No players found</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-accent-green hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((player, i) => {
                  const rating = overallRating(player.goals, player.assists, player.apps)
                  const rarity = rarityFromRating(rating)
                  const avatarUrl = player.avatar
                    ? `https://cdn.discordapp.com/avatars/${player.discord_id}/${player.avatar}.png?size=128`
                    : null
                  const displayName = player.global_name || player.username
                  const maxStat = Math.max(player.goals, player.assists, player.apps, 1)

                  return (
                    <StaggerItem key={player.user_id}>
                      <Link href={`/profile/${player.user_id}`}>
                        <Card variant="player" hover padding="md" className="group h-full">
                          <div className="flex items-start gap-3 mb-3">
                            {/* Avatar */}
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white",
                                rarityConfig[rarity].bg
                              )}
                            >
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={displayName}
                                  className="w-full h-full rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                displayName.slice(0, 2).toUpperCase()
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white truncate group-hover:text-accent-green transition-colors">
                                  {displayName}
                                </span>
                                <Badge variant="rarity" rarity={rarity}>
                                  {rating}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {player.position && (
                                  <Badge variant="outline" className="!px-1.5 !py-0 !text-[10px]">
                                    {player.position}
                                  </Badge>
                                )}
                                {player.club_name && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: player.club_color }}
                                    />
                                    <span className="text-[11px] text-text-muted truncate">
                                      {player.club_name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats Bars (FIFA-style) */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">Apps</span>
                              <span className="font-bold tabular-nums">{player.apps}</span>
                            </div>
                            <Progress value={player.apps} max={maxStat} size="sm" />

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">Goals</span>
                              <span className="font-bold tabular-nums text-accent-green">{player.goals}</span>
                            </div>
                            <Progress value={player.goals} max={maxStat} size="sm" variant="success" />

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">Assists</span>
                              <span className="font-bold tabular-nums text-accent-blue">{player.assists}</span>
                            </div>
                            <Progress value={player.assists} max={maxStat} size="sm" />
                          </div>
                        </Card>
                      </Link>
                    </StaggerItem>
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
