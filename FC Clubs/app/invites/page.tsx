"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar } from "@/components/ui/avatar"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Check, X, Mail, Clock, Send } from "lucide-react"
import { toast } from "sonner"
import { timeAgo } from "@/lib/utils"

interface Invite {
  id: string
  sender_id: string
  sender_name: string
  club_id: string
  club_name: string
  club_color: string
  message: string
  status: string
  created_at: string
}

export default function InvitesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  const { data, isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const res = await fetch("/api/invites")
      return res.json() as Promise<{ invites: Invite[] }>
    },
    enabled: !!user,
  })

  const respondMutation = useMutation({
    mutationFn: async ({ inviteId, status }: { inviteId: string; status: "accepted" | "declined" }) => {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to respond")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] })
      toast.success("Invite updated!")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (authLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Skeleton className="w-96 h-64 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  const invites = data?.invites ?? []

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="max-w-3xl mx-auto space-y-6">
          <StaggerItem>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <Mail size={20} className="text-accent-green" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Invitations</h1>
                <p className="text-sm text-text-muted">
                  Club invites from captains and managers.
                </p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : invites.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-text-muted" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">No pending invites</p>
                <p className="text-sm text-text-muted">
                  When a captain invites you to their club, it will show up here.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {invites.map((invite) => (
                  <StaggerItem key={invite.id}>
                    <Card variant="glass" padding="md">
                      <div className="flex items-start gap-4">
                        <Avatar name={invite.club_name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white">{invite.club_name}</h3>
                            <Badge variant="outline" className="border-accent-green/20 text-accent-green">
                              <Send size={10} />
                              Invited
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">
                            From <span className="font-medium text-white">{invite.sender_name}</span>
                          </p>
                          {invite.message && (
                            <p className="text-sm text-text-muted mt-2 italic">
                              &ldquo;{invite.message}&rdquo;
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                            <Clock size={12} />
                            {timeAgo(invite.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => respondMutation.mutate({ inviteId: invite.id, status: "accepted" })}
                            disabled={respondMutation.isPending}
                          >
                            <Check size={14} />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => respondMutation.mutate({ inviteId: invite.id, status: "declined" })}
                            disabled={respondMutation.isPending}
                            className="text-accent-red hover:text-accent-red hover:bg-accent-red/10"
                          >
                            <X size={14} />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            )}
          </StaggerItem>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}
