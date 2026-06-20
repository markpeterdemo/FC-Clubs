"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Search, Shield, Ban, CheckCircle2, Users, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface AdminUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
  discord_id: string
  email: string | null
  is_admin: boolean
  banned: boolean
  club_name: string | null
  role: string | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  totalPages: number
}

function UserCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  )
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (search) params.set("q", search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      return res.json()
    },
  })

  const toggleAdmin = useMutation({
    mutationFn: async (user: AdminUser) => {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !user.is_admin }),
      })
      if (!res.ok) throw new Error("Failed to update user")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User updated")
    },
    onError: () => toast.error("Failed to update user"),
  })

  const toggleBan = useMutation({
    mutationFn: async (user: AdminUser) => {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned }),
      })
      if (!res.ok) throw new Error("Failed to update user")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setBanTarget(null)
      toast.success("User ban status updated")
    },
    onError: () => toast.error("Failed to update user"),
  })

  return (
    <AdminSidebar>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white">User Management</h1>
                <p className="text-sm text-text-muted mt-1">Manage users, roles, and bans</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="relative mb-6">
              <Input
                icon={<Search size={16} />}
                placeholder="Search by username, email or Discord ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </StaggerItem>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <UserCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Users size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-accent-red text-sm">Failed to load users.</p>
            </Card>
          ) : data?.users.length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Users size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted text-sm">No users found</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {data?.users.map((user) => (
                  <StaggerItem key={user.id}>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Avatar name={user.global_name || user.username} src={user.avatar} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">
                              {user.global_name || user.username}
                            </span>
                            {user.is_admin && <Badge variant="success">Admin</Badge>}
                            {user.banned && <Badge variant="danger">Banned</Badge>}
                          </div>
                          <p className="text-xs text-text-muted truncate">
                            {user.discord_id}
                            {user.email && <> &middot; {user.email}</>}
                            {user.club_name && <> &middot; {user.club_name}{user.role && ` (${user.role})`}</>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={user.is_admin ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => toggleAdmin.mutate(user)}
                            disabled={toggleAdmin.isPending}
                          >
                            <Shield size={14} />
                            {user.is_admin ? "Admin" : "Make Admin"}
                          </Button>
                          <Button
                            variant={user.banned ? "secondary" : "danger"}
                            size="sm"
                            onClick={() => setBanTarget(user)}
                            disabled={toggleBan.isPending}
                          >
                            <Ban size={14} />
                            {user.banned ? "Unban" : "Ban"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </div>

              {(data?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-text-muted px-3">
                    Page {data?.page} of {data?.totalPages}
                  </span>
                  <Button variant="secondary" size="sm" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(page + 1)}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </StaggerContainer>

        <Dialog open={!!banTarget} onClose={() => setBanTarget(null)}>
          <DialogTitle>
            {banTarget?.banned ? "Unban User" : "Ban User"}
          </DialogTitle>
          <DialogDescription>
            {banTarget?.banned
              ? `Are you sure you want to unban ${banTarget?.global_name || banTarget?.username}?`
              : `Are you sure you want to ban ${banTarget?.global_name || banTarget?.username}? This will prevent them from accessing the platform.`
            }
          </DialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setBanTarget(null)}>Cancel</Button>
            <Button
              variant={banTarget?.banned ? "primary" : "danger"}
              onClick={() => banTarget && toggleBan.mutate(banTarget)}
              disabled={toggleBan.isPending}
            >
              {banTarget?.banned ? "Yes, Unban" : "Yes, Ban"}
            </Button>
          </div>
        </Dialog>
      </PageTransition>
    </AdminSidebar>
  )
}
