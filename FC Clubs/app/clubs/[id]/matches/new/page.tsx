"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Swords, Calendar, Users } from "lucide-react"

const FORMATIONS = [
  "4-3-3", "4-4-2", "3-5-2", "4-2-3-1",
  "5-3-2", "4-1-4-1", "3-4-3", "4-5-1",
]

export default function NewMatchPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.id as string

  const [opponentId, setOpponentId] = useState("")
  const [matchDate, setMatchDate] = useState("")
  const [matchTime, setMatchTime] = useState("")
  const [formation, setFormation] = useState("4-3-3")

  const { data: myClub } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${clubId}`)
      return res.json()
    },
  })

  const { data: clubsData } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch("/api/clubs")
      return res.json() as Promise<{ clubs: any[] }>
    },
  })

  const createMatch = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_club_id: clubId,
          away_club_id: opponentId,
          match_date: `${matchDate}T${matchTime}:00`,
          formation_home: formation,
          formation_away: "4-3-3",
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create match")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Match created!")
      router.push(`/clubs/${clubId}`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (!myClub?.club || !clubsData) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  const otherClubs = clubsData.clubs.filter((c: any) => c.id !== clubId)

  const canSubmit = opponentId && matchDate && matchTime

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="max-w-lg mx-auto space-y-6">
          <StaggerItem>
            <div>
              <h1 className="text-2xl font-black">New Match</h1>
              <p className="text-sm text-text-muted mt-1">
                Schedule a match for {myClub.club.name}
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Card variant="glass" padding="lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Opponent
                  </label>
                  <Select
                    value={opponentId}
                    onChange={(e) => setOpponentId(e.target.value)}
                    options={otherClubs.map((c: any) => ({
                      value: c.id,
                      label: `${c.short_name || c.name.slice(0, 3)} — ${c.name}`,
                    }))}
                    placeholder="Select opponent..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Formation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FORMATIONS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormation(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          formation === f
                            ? "bg-accent-green text-black"
                            : "bg-white/5 text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/5 border border-accent-green/10 text-sm text-text-secondary">
                  <Swords size={16} className="text-accent-green shrink-0" />
                  The opposing captain will need to confirm the lineup before the match.
                </div>

                <Button
                  variant="glow"
                  className="w-full"
                  disabled={!canSubmit || createMatch.isPending}
                  onClick={() => createMatch.mutate()}
                >
                  <Calendar size={16} />
                  Schedule Match
                </Button>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
