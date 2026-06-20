"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"
import { Goal, Clock, Users, AlertTriangle } from "lucide-react"

export default function MatchCenterPage() {
  const params = useParams()
  const matchId = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}`)
      if (!res.ok) throw new Error("Match not found")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!data?.match) {
    return (
      <AppLayout>
        <Card variant="glass" padding="lg" className="text-center py-16">
          <AlertTriangle size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted">Match not found</p>
        </Card>
      </AppLayout>
    )
  }

  const { match, lineups = [], events = [] } = data
  const isCompleted = match.status === "completed"
  const homeEvents = events.filter((e: any) => e.club_id === match.home_club_id)
  const awayEvents = events.filter((e: any) => e.club_id === match.away_club_id)

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="space-y-6">
          {/* Score Header */}
          <StaggerItem>
            <Card variant="glass" padding="lg" className="relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background: `linear-gradient(90deg, ${match.home_color} 0%, transparent 50%, ${match.away_color} 100%)`,
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                    style={{ backgroundColor: match.home_color }}
                  >
                    {match.home_short}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">{match.home_name}</p>
                    <p className="text-xs text-text-muted">Home</p>
                  </div>
                </div>

                <div className="text-center px-6">
                  <div className="flex items-center gap-4">
                    <motion.span
                      key={match.home_score}
                      initial={{ rotateX: 90 }}
                      animate={{ rotateX: 0 }}
                      className="text-5xl font-black tabular-nums"
                      style={{ color: match.home_color }}
                    >
                      {isCompleted ? match.home_score : "-"}
                    </motion.span>
                    <span className="text-2xl text-text-muted">:</span>
                    <motion.span
                      key={match.away_score}
                      initial={{ rotateX: 90 }}
                      animate={{ rotateX: 0 }}
                      className="text-5xl font-black tabular-nums"
                      style={{ color: match.away_color }}
                    >
                      {isCompleted ? match.away_score : "-"}
                    </motion.span>
                  </div>
                  <Badge variant={isCompleted ? "success" : "warning"} className="mt-2">
                    {isCompleted ? "Full Time" : "Scheduled"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end">
                  <div className="text-left">
                    <p className="font-bold text-white text-lg">{match.away_name}</p>
                    <p className="text-xs text-text-muted">Away</p>
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                    style={{ backgroundColor: match.away_color }}
                  >
                    {match.away_short}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-text-muted">
                <Clock size={14} />
                {formatDate(match.match_date)} at {formatTime(match.match_date)}
                {match.formation_home && (
                  <span className="ml-4">{match.formation_home} vs {match.formation_away}</span>
                )}
              </div>
            </Card>
          </StaggerItem>

          {/* Pitch View */}
          <StaggerItem>
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Formation</CardTitle>
              </CardHeader>
              <div className="relative bg-gradient-to-b from-accent-green/20 to-accent-green/5 rounded-xl p-6 min-h-[300px]">
                <div className="absolute inset-0 border-2 border-white/5 rounded-xl m-4" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />
                <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

                <div className="relative grid grid-cols-1 gap-4 h-full">
                  {lineups
                    .filter((l: any) => !l.is_substitute)
                    .map((player: any, i: number) => {
                      const colors = player.club_id === match.home_club_id ? match.home_color : match.away_color
                      const side = player.club_id === match.home_club_id ? "justify-start" : "justify-end"
                      return (
                        <motion.div
                          key={player.player_id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex ${side} items-center gap-2`}
                        >
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg"
                            style={{ backgroundColor: colors + "30", borderColor: colors + "50", borderWidth: 1 }}
                          >
                            <span className="text-white">{player.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">{player.position}</Badge>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>

                {lineups.filter((l: any) => l.is_substitute).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-text-muted mb-2">Substitutes</p>
                    <div className="flex flex-wrap gap-2">
                      {lineups.filter((l: any) => l.is_substitute).map((sub: any) => (
                        <Badge key={sub.player_id} variant="outline">
                          {sub.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </StaggerItem>

          {/* Match Events Timeline */}
          {isCompleted && events.length > 0 && (
            <StaggerItem>
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Match Events</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {events
                    .sort((a: any, b: any) => a.minute - b.minute)
                    .map((event: any, i: number) => {
                      const isHome = event.club_id === match.home_club_id
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: isHome ? -12 : 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`flex items-center gap-3 ${isHome ? "justify-start" : "justify-end flex-row-reverse"}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${isHome ? "" : "flex-row-reverse"}`}
                          >
                            <span className="text-xs font-bold text-text-muted min-w-[3ch] text-center">
                              {event.minute}&apos;
                            </span>
                            <div
                              className="flex items-center gap-2 px-3 py-2 rounded-xl"
                              style={{
                                backgroundColor: isHome ? match.home_color + "15" : match.away_color + "15",
                                borderColor: isHome ? match.home_color + "30" : match.away_color + "30",
                                borderWidth: 1,
                              }}
                            >
                              {event.type === "goal" && <Goal size={14} className="text-accent-green" />}
                              {event.type === "yellow_card" && <AlertTriangle size={14} className="text-accent-gold" />}
                              {event.type === "red_card" && <AlertTriangle size={14} className="text-accent-red" />}
                              <span className="text-sm font-medium">{event.player_name}</span>
                              {event.related_player_name && (
                                <span className="text-xs text-text-muted">(assist: {event.related_player_name})</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </Card>
            </StaggerItem>
          )}
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
