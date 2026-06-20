"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Trophy, Medal, Crown, Star, Award } from "lucide-react"
import { cn } from "@/lib/utils"

// Placeholder data — will be replaced with real API data once backend is built
const SEASONS = [
  {
    season: "Spring 2025",
    champion: "FC Phoenix",
    championColor: "#ef4444",
    runnerUp: "Elite United",
    runnerUpColor: "#3b82f6",
    third: "Velocity FC",
    thirdColor: "#22c55e",
    championPts: 42,
    runnerUpPts: 38,
    thirdPts: 35,
  },
  {
    season: "Fall 2024",
    champion: "Iron Wolves",
    championColor: "#8b5cf6",
    runnerUp: "Night Hawks",
    runnerUpColor: "#1e1e38",
    third: "Fusion FC",
    thirdColor: "#f59e0b",
    championPts: 40,
    runnerUpPts: 36,
    thirdPts: 33,
  },
  {
    season: "Spring 2024",
    champion: "Elite United",
    championColor: "#3b82f6",
    runnerUp: "FC Phoenix",
    runnerUpColor: "#ef4444",
    third: "Iron Wolves",
    thirdColor: "#8b5cf6",
    championPts: 44,
    runnerUpPts: 41,
    thirdPts: 37,
  },
]

const podiumColors: Record<number, { bg: string; text: string; icon: typeof Trophy; label: string; shadow: string }> = {
  1: {
    bg: "from-amber-400/20 to-amber-600/10 border-amber-500/30",
    text: "text-amber-400",
    icon: Crown,
    label: "Champion",
    shadow: "shadow-amber-500/20",
  },
  2: {
    bg: "from-gray-300/15 to-gray-400/10 border-gray-400/25",
    text: "text-gray-300",
    icon: Medal,
    label: "Runner-up",
    shadow: "shadow-gray-400/15",
  },
  3: {
    bg: "from-amber-700/15 to-amber-800/10 border-amber-700/25",
    text: "text-amber-600",
    icon: Award,
    label: "Third Place",
    shadow: "shadow-amber-700/15",
  },
}

export default function HallOfFamePage() {
  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <StaggerItem>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                <Trophy size={20} className="text-accent-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-black">
                  <span className="text-gradient-gold">Hall of Fame</span>
                </h1>
                <p className="text-sm text-text-muted">
                  Every season&rsquo;s champions, runners-up, and top clubs immortalized.
                </p>
              </div>
            </div>
          </StaggerItem>

          {SEASONS.map((season, idx) => {
            const [first, second, third] = [
              { name: season.champion, color: season.championColor, pts: season.championPts, rank: 1 as const },
              { name: season.runnerUp, color: season.runnerUpColor, pts: season.runnerUpPts, rank: 2 as const },
              { name: season.third, color: season.thirdColor, pts: season.thirdPts, rank: 3 as const },
            ]

            return (
              <StaggerItem key={season.season}>
                <div className="space-y-4">
                  {/* Season header */}
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className={idx === 0 ? "text-accent-gold" : "text-text-muted"} />
                    <h2 className={cn("text-lg font-black", idx === 0 ? "text-white" : "text-text-secondary")}>
                      {season.season}
                    </h2>
                    {idx === 0 && (
                      <Badge variant="success" className="text-xs">
                        Current Season
                      </Badge>
                    )}
                  </div>

                  {/* Podium */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[first, second, third].map((club) => {
                      const p = podiumColors[club.rank]
                      const Icon = p.icon

                      return (
                        <Card
                          key={club.rank}
                          variant="glass"
                          padding="md"
                          className={cn(
                            "bg-gradient-to-br border",
                            p.bg,
                            p.shadow,
                            club.rank === 1 && "sm:-mt-4 sm:mb-0 scale-105 sm:scale-110 z-10 relative"
                          )}
                        >
                          <div className="flex flex-col items-center text-center py-3">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg",
                                "bg-gradient-to-br",
                                club.rank === 1 ? "from-amber-400/20 to-amber-600/20" : "from-white/5 to-white/[0.02]"
                              )}
                              style={{ borderLeft: `3px solid ${club.color}` }}
                            >
                              <Icon size={22} className={p.text} />
                            </div>
                            <h3
                              className="font-extrabold text-base text-white"
                            >
                              {club.name}
                            </h3>
                            <Badge variant={club.rank === 1 ? "success" : "outline"} className="mt-2">
                              {p.label}
                            </Badge>
                            <p className="text-xs text-text-muted mt-2">
                              {club.pts} points
                            </p>
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {idx < SEASONS.length - 1 && <Separator className="mt-6" />}
                </div>
              </StaggerItem>
            )
          })}

          {/* Info card */}
          <StaggerItem>
            <Card variant="default" padding="md" className="border-dashed border-white/10">
              <div className="flex items-start gap-3">
                <Star size={18} className="text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary font-medium">More to come</p>
                  <p className="text-xs text-text-muted mt-1">
                    Player awards, golden boot, best XI, and all-time records will appear here once the
                    backend is fully connected.
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
