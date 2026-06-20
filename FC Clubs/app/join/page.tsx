"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Search, Users, Shield, Lock, Send } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface Club {
  id: string
  name: string
  short_name: string
  primary_color: string
  description: string
  visibility: string
  member_count: number
  max_members: number
}

export default function JoinPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [q, setQ] = useState("")
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", q],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      const res = await fetch(`/api/clubs?${params}`)
      return res.json() as Promise<{ clubs: Club[] }>
    },
    enabled: !!user,
  })

  const joinMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const res = await fetch(`/api/clubs/${clubId}/members`, { method: "POST" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to join")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Joined club!")
      router.push("/dashboard")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const requestMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: clubId }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to request")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Join request sent!")
      setSelectedClub(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-96 h-64 rounded-2xl" />
      </div>
    )
  }

  const handleClubAction = (club: Club) => {
    if (club.visibility === "public") {
      joinMutation.mutate(club.id)
    } else {
      setSelectedClub(club)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        <StaggerContainer>
          <StaggerItem>
            <div>
              <h1 className="text-2xl font-black">Find a Club</h1>
              <p className="text-sm text-text-muted mt-1">Browse clubs and join the action.</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Input
              icon={<Search size={16} />}
              placeholder="Search clubs by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : clubs?.clubs.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-12">
                <Users size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-text-muted">No clubs found</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {clubs?.clubs.map((club, i) => (
                  <StaggerItem key={club.id}>
                    <Card variant="glass" hover padding="md" className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg"
                          style={{ backgroundColor: club.primary_color }}
                        >
                          {club.short_name || club.name.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white">{club.name}</h3>
                            {club.visibility === "private" && (
                              <Lock size={12} className="text-accent-gold" />
                            )}
                          </div>
                          <p className="text-xs text-text-muted line-clamp-1">
                            {club.description || "No description"}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Users size={12} />
                              {club.member_count}/{club.max_members}
                            </span>
                            <Badge variant={club.visibility === "public" ? "success" : "warning"}>
                              {club.visibility}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={club.visibility === "public" ? "primary" : "secondary"}
                        onClick={() => handleClubAction(club)}
                        disabled={joinMutation.isPending}
                      >
                        {club.visibility === "public" ? "Join" : "Request"}
                      </Button>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            )}
          </StaggerItem>
        </StaggerContainer>
      </div>

      <Dialog open={!!selectedClub} onClose={() => setSelectedClub(null)}>
        <DialogTitle>Request to Join</DialogTitle>
        <DialogDescription>
          Send a join request to <strong>{selectedClub?.name}</strong>? The club captain will review your request.
        </DialogDescription>
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" className="flex-1" onClick={() => setSelectedClub(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => selectedClub && requestMutation.mutate(selectedClub.id)}
            disabled={requestMutation.isPending}
          >
            <Send size={16} />
            Send Request
          </Button>
        </div>
      </Dialog>
    </PageTransition>
  )
}
