"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Check, X, Send, Mail, Clock, Trophy, Medal, Ban, ArrowRight, Bell } from "lucide-react"
import { toast } from "sonner"
import { cn, timeAgo } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  message: string
  reference_id: string
  read_at: string | null
  created_at: string
}

const notificationIcons: Record<string, typeof Bell> = {
  match: Trophy,
  match_result: Trophy,
  award: Medal,
  achievement: Medal,
  invite: Mail,
  invite_accepted: Check,
  invite_declined: X,
  approved: Check,
  rejected: Ban,
  transfer: ArrowRight,
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications")
      return res.json() as Promise<{ notifications: Notification[] }>
    },
    enabled: !!user,
  })

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to mark as read")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (err: Error) => toast.error(err.message),
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", { method: "POST" })
      if (!res.ok) throw new Error("Failed to mark all as read")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
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

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read_at).length

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer className="max-w-3xl mx-auto space-y-6">
          <StaggerItem>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <Bell size={20} className="text-accent-green" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">Notifications</h1>
                  <p className="text-sm text-text-muted">
                    Stay up to date with league activity.
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  <Check size={14} />
                  Mark all read
                </Button>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <Card variant="glass" padding="lg" className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Bell size={28} className="text-text-muted" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">No notifications yet</p>
                <p className="text-sm text-text-muted">
                  When something happens &mdash; match results, invites, awards &mdash; you&rsquo;ll see it here.
                </p>
              </Card>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  const isUnread = !notification.read_at

                  return (
                    <StaggerItem key={notification.id}>
                      <button
                        onClick={() => isUnread && markReadMutation.mutate(notification.id)}
                        className={cn(
                          "w-full text-left rounded-2xl border transition-all duration-200 p-4",
                          "hover:bg-white/[0.02]",
                          isUnread
                            ? "bg-white/[0.02] border-l-2 border-l-accent-green border-white/5"
                            : "bg-transparent border-transparent"
                        )}
                        disabled={!isUnread}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                              isUnread ? "bg-accent-green/10" : "bg-white/5"
                            )}
                          >
                            <Icon
                              size={16}
                              className={isUnread ? "text-accent-green" : "text-text-muted"}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm",
                                isUnread ? "text-white font-medium" : "text-text-secondary"
                              )}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                              <Clock size={11} />
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          {isUnread && <div className="w-2 h-2 rounded-full bg-accent-green shrink-0" />}
                        </div>
                      </button>
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
