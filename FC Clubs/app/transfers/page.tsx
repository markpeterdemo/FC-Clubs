"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-context"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { DollarSign, ArrowRight, Clock, Shield, Users, Ban, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Placeholder data — will be replaced with real API data once backend is built
const SAMPLE_LISTINGS = [
  {
    id: "1",
    player_name: "Alex Prodigy",
    position: "ST",
    from_club: "FC Phoenix",
    to_club: "Elite United",
    status: "pending" as const,
    rating: 87,
    fee: "50,000",
    created_at: "2025-06-18T10:00:00Z",
  },
  {
    id: "2",
    player_name: "Marcus Steel",
    position: "CM",
    from_club: "Iron Wolves",
    to_club: "Velocity FC",
    status: "approved" as const,
    rating: 82,
    fee: "35,000",
    created_at: "2025-06-17T14:30:00Z",
  },
  {
    id: "3",
    player_name: "Kai Shadow",
    position: "GK",
    from_club: "Night Hawks",
    to_club: "Fusion FC",
    status: "rejected" as const,
    rating: 79,
    fee: "20,000",
    created_at: "2025-06-16T09:15:00Z",
  },
  {
    id: "4",
    player_name: "Ryo Flash",
    position: "LW",
    from_club: "Velocity FC",
    to_club: "FC Phoenix",
    status: "pending" as const,
    rating: 85,
    fee: "42,000",
    created_at: "2025-06-15T18:45:00Z",
  },
]

const statusConfig = {
  pending: { label: "Pending Approval", variant: "warning" as const, icon: Clock },
  approved: { label: "Approved", variant: "success" as const, icon: Check },
  rejected: { label: "Rejected", variant: "danger" as const, icon: Ban },
}

// Countdown target — placeholder date
const WINDOW_CLOSE = new Date("2025-08-01T00:00:00Z")

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    function tick() {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return setRemaining("Window closed")
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRemaining(`${d}d ${h}h ${m}m`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [target])

  return remaining
}

export default function TransfersPage() {
  const { user, loading: authLoading } = useAuth()
  const countdown = useCountdown(WINDOW_CLOSE)

  const { data: myClub } = useQuery({
    queryKey: ["my-club"],
    queryFn: async () => {
      const res = await fetch("/api/clubs/my")
      if (!res.ok) return null
      return res.json() as Promise<{ club: { id: string; name: string } | null; stats: unknown }>
    },
    enabled: !!user,
  })

  const isCaptain = myClub?.club != null
  const [listing, setListing] = useState(SAMPLE_LISTINGS)

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <StaggerItem>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-accent-green" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">Transfer Market</h1>
                  <p className="text-sm text-text-muted">
                    Buy, sell, and approve player transfers between clubs.
                  </p>
                </div>
              </div>
              {isCaptain && (
                <Button variant="glow" size="sm">
                  <DollarSign size={14} />
                  List Player
                </Button>
              )}
            </div>
          </StaggerItem>

          {/* Window status */}
          <StaggerItem>
            <Card variant="elevated" padding="md" className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-accent-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Transfer Window Active</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Closes in {countdown} &middot; Summer 2025 Window
                </p>
              </div>
              <Badge variant="success" className="shrink-0">
                <Shield size={10} />
                Open
              </Badge>
            </Card>
          </StaggerItem>

          {/* Listings */}
          <StaggerItem>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Active Listings ({listing.length})
              </h2>
            </div>
          </StaggerItem>

          <div className="space-y-3">
            {listing.map((transfer, i) => {
              const status = statusConfig[transfer.status]
              const StatusIcon = status.icon

              return (
                <StaggerItem key={transfer.id}>
                  <Card variant="glass" padding="md">
                    <div className="flex items-center gap-4">
                      <Avatar name={transfer.player_name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white">{transfer.player_name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {transfer.position}
                          </Badge>
                          <Badge variant="rarity" rarity={transfer.rating >= 85 ? "legendary" : transfer.rating >= 75 ? "epic" : "rare"}>
                            {transfer.rating} OVR
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                          <span className="text-text-secondary">{transfer.from_club}</span>
                          <ArrowRight size={12} />
                          <span className="text-accent-green">{transfer.to_club}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-accent-gold">{transfer.fee}</p>
                        <Badge variant={status.variant} className="mt-1">
                          <StatusIcon size={10} />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              )
            })}
          </div>

          {/* Info card */}
          <StaggerItem>
            <Card variant="default" padding="md" className="border-dashed border-white/10">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary font-medium">How transfers work</p>
                  <p className="text-xs text-text-muted mt-1">
                    Captains and managers list players for transfer. Other clubs can request to buy,
                    and the listing club&rsquo;s captain approves or rejects the deal. All transfers
                    are subject to admin review.
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    <span className="italic">Full backend integration coming soon &mdash; this page shows the planned UI.</span>
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
