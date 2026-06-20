"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/auth-context"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress, CircularProgress } from "@/components/ui/progress"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn, formatDate, rarityFromRating, overallRating } from "@/lib/utils"
import { useState } from "react"
import {
  Goal, Award, Activity, Shield, Zap, Medal, Edit3,
  Sword, Flame, Star, Target, Trophy, Users,
} from "lucide-react"
import { toast } from "sonner"

interface LeaderEntry {
  id: string
  name: string
  avatar: string | null
  value: number
  club_name: string
  club_color: string
}

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const
type StatLabel = (typeof STAT_LABELS)[number]

function calcStats(goals: number, assists: number, apps: number, position?: string): Record<StatLabel, number> {
  const PAC = Math.min(50 + Math.round((goals / Math.max(apps, 1)) * 15 + Math.min(apps * 0.8, 15)), 99)
  const SHO = Math.min(50 + Math.round(goals * 2.5), 99)
  const PAS = Math.min(50 + Math.round(assists * 2.5), 99)
  const DRI = overallRating(goals, assists, apps)
  const baseDef = position && ["CB", "LB", "RB", "CDM"].includes(position) ? 60 : 45
  const DEF = Math.min(baseDef + Math.round(apps * 0.4 + assists * 0.5), 99)
  const PHY = Math.min(50 + Math.round(Math.min(apps * 1.2, 25) + goals * 0.5), 99)
  return { PAC, SHO, PAS, DRI, DEF, PHY }
}

const PLACEHOLDER_BADGES = [
  { icon: Trophy, label: "First Win", unlocked: false },
  { icon: Star, label: "Goal Scorer", unlocked: false },
  { icon: Zap, label: "Playmaker", unlocked: false },
  { icon: Shield, label: "Defender", unlocked: false },
  { icon: Flame, label: "On Fire", unlocked: false },
  { icon: Target, label: "Sharp Shooter", unlocked: false },
  { icon: Medal, label: "Veteran", unlocked: false },
  { icon: Sword, label: "Champion", unlocked: false },
]

function fetchLeaders(stat: string) {
  return async () => {
    const res = await fetch(`/api/players/leaders?stat=${stat}`)
    return res.json() as Promise<{ leaders: LeaderEntry[] }>
  }
}

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [newPosition, setNewPosition] = useState("")

  const isOwnProfile = user?.id === profileId

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["player-leaders", "apps"],
    queryFn: fetchLeaders("apps"),
  })
  const { data: goalsData } = useQuery({
    queryKey: ["player-leaders", "goals"],
    queryFn: fetchLeaders("goals"),
  })
  const { data: assistsData } = useQuery({
    queryKey: ["player-leaders", "assists"],
    queryFn: fetchLeaders("assists"),
  })

  const player = appsData?.leaders?.find((l) => l.id === profileId)
  const goalsEntry = goalsData?.leaders?.find((l) => l.id === profileId)
  const assistsEntry = assistsData?.leaders?.find((l) => l.id === profileId)

  const playerName = player?.name || (isOwnProfile ? (user?.global_name || user?.username) : null) || "Unknown Player"
  const playerAvatar = player?.avatar ?? (isOwnProfile ? user?.avatar : null) ?? null
  const playerPosition = isOwnProfile ? user?.position : null
  const clubName = player?.club_name
  const clubColor = player?.club_color

  const playerStats = {
    goals: goalsEntry?.value ?? 0,
    assists: assistsEntry?.value ?? 0,
    apps: player?.value ?? 0,
  }

  const rating = overallRating(playerStats.goals, playerStats.assists, playerStats.apps)
  const rarity = rarityFromRating(rating)
  const statBars = calcStats(playerStats.goals, playerStats.assists, playerStats.apps, playerPosition ?? undefined)
  const winRate = playerStats.apps > 0 ? Math.round((playerStats.goals / Math.max(playerStats.apps, 1)) * 50 + 30) : 0

  const editMutation = useMutation({
    mutationFn: async (body: { position: string }) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Profile updated")
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      setEditOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openEdit = () => {
    setNewPosition(user?.position || "")
    setEditOpen(true)
  }

  if (appsLoading) return <ProfileSkeleton />

  const notFound = !isOwnProfile && !player

  if (notFound) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Users size={48} className="text-text-muted" />
            <h2 className="text-xl font-bold">Player not found</h2>
            <p className="text-sm text-text-muted">
              This player hasn&apos;t played any matches yet or doesn&apos;t exist.
            </p>
          </div>
        </PageTransition>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer>
          {/* Hero Section */}
          <StaggerItem>
            <Card variant="gradient" padding="lg" className="relative overflow-hidden mb-6">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: clubColor
                    ? `radial-gradient(ellipse at 30% 40%, ${clubColor}55 0%, transparent 70%)`
                    : undefined,
                }}
              />
              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar
                  name={playerName}
                  src={
                    playerAvatar
                      ? `https://cdn.discordapp.com/avatars/${user?.discord_id || ""}/${playerAvatar}.png?size=128`
                      : null
                  }
                  size="xl"
                  ring
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                    <h1 className="text-2xl md:text-3xl font-black">{playerName}</h1>
                    <Badge variant="rarity" rarity={rarity}>{rating}</Badge>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start mt-1">
                    {playerPosition && <Badge variant="success">{playerPosition}</Badge>}
                    {clubName && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Shield size={10} />
                        {clubName}
                      </Badge>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button variant="secondary" size="sm" className="mt-4" onClick={openEdit}>
                      <Edit3 size={14} /> Edit Profile
                    </Button>
                  )}
                </div>
                <div className="hidden md:block">
                  <CircularProgress value={rating} size={88} strokeWidth={7} label="Overall" />
                </div>
              </div>
              <div className="flex md:hidden justify-center mt-4">
                <CircularProgress value={rating} size={80} strokeWidth={6} label="Overall" />
              </div>
            </Card>
          </StaggerItem>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Stats bars + Stats cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* FIFA-style Stat Bars */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Zap size={16} className="text-accent-green" />
                      Player Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {STAT_LABELS.map((label) => {
                      const val = statBars[label]
                      const variant = val >= 80 ? "success" : val >= 65 ? "warning" : "danger"
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-bold text-white">{label}</span>
                            <span
                              className={cn(
                                "font-black tabular-nums",
                                val >= 80
                                  ? "text-accent-green"
                                  : val >= 65
                                    ? "text-accent-gold"
                                    : "text-accent-red"
                              )}
                            >
                              {val}
                            </span>
                          </div>
                          <Progress value={val} variant={variant} size="md" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Stats Cards */}
              <StaggerItem>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Goals", value: playerStats.goals, icon: Goal, color: "text-accent-green" },
                    { label: "Assists", value: playerStats.assists, icon: Award, color: "text-accent-blue" },
                    { label: "Appearances", value: playerStats.apps, icon: Activity, color: "text-accent-purple" },
                    { label: "Win Rate", value: `${winRate}%`, icon: Trophy, color: "text-accent-gold" },
                  ].map((s) => {
                    const Icon = s.icon
                    return (
                      <Card key={s.label} variant="glass" padding="md" className="text-center">
                        <Icon size={20} className={cn("mx-auto mb-1.5", s.color)} />
                        <div className={cn("text-xl font-black", s.color)}>{s.value}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                          {s.label}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </StaggerItem>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Achievement Badges */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Medal size={16} className="text-accent-gold" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {PLACEHOLDER_BADGES.map((badge, i) => {
                        const Icon = badge.icon
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                              badge.unlocked ? "bg-accent-gold/10" : "bg-white/5 opacity-40 grayscale"
                            )}
                          >
                            <Icon
                              size={22}
                              className={badge.unlocked ? "text-accent-gold" : "text-text-muted"}
                            />
                            <span className="text-[9px] text-text-muted text-center leading-tight">
                              {badge.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-center text-[11px] text-text-muted mt-4">
                      Complete matches and earn achievements.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Recent Form Placeholder */}
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Activity size={16} className="text-accent-cyan" />
                      Recent Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <Activity size={28} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm text-text-muted">No recent match data available.</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </PageTransition>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>Update your position and profile settings.</DialogDescription>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Position</label>
            <Select
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              options={[
                { value: "GK", label: "Goalkeeper" },
                { value: "CB", label: "Centre Back" },
                { value: "LB", label: "Left Back" },
                { value: "RB", label: "Right Back" },
                { value: "CDM", label: "Defensive Midfielder" },
                { value: "CM", label: "Centre Midfielder" },
                { value: "CAM", label: "Attacking Midfielder" },
                { value: "LM", label: "Left Midfielder" },
                { value: "RM", label: "Right Midfielder" },
                { value: "LW", label: "Left Wing" },
                { value: "RW", label: "Right Wing" },
                { value: "ST", label: "Striker" },
              ]}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => editMutation.mutate({ position: newPosition })}
              disabled={editMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>
    </AppLayout>
  )
}

function ProfileSkeleton() {
  return (
    <AppLayout>
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-2xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-2xl" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
