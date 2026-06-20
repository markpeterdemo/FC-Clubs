"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Search, Shield, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface AdminClub {
  id: string
  name: string
  short_name: string | null
  primary_color: string
  member_count: number
  visibility: string
}

interface ClubsResponse {
  clubs: AdminClub[]
  total: number
  page: number
  totalPages: number
}

function ClubCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </Card>
  )
}

export default function AdminClubs() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [editClub, setEditClub] = useState<AdminClub | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminClub | null>(null)
  const [editName, setEditName] = useState("")
  const [editShort, setEditShort] = useState("")
  const [editColor, setEditColor] = useState("")

  const { data, isLoading, error } = useQuery<ClubsResponse>({
    queryKey: ["admin-clubs", page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (search) params.set("q", search)
      const res = await fetch(`/api/admin/clubs?${params}`)
      if (!res.ok) throw new Error("Failed to fetch clubs")
      return res.json()
    },
  })

  const updateClub = useMutation({
    mutationFn: async (club: AdminClub) => {
      const body: Record<string, string> = {}
      if (editName !== club.name) body.name = editName
      if (editShort !== (club.short_name || "")) body.short_name = editShort
      if (editColor !== club.primary_color) body.primary_color = editColor
      const res = await fetch(`/api/admin/clubs/${club.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to update club")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clubs"] })
      setEditClub(null)
      toast.success("Club updated")
    },
    onError: () => toast.error("Failed to update club"),
  })

  const deleteClub = useMutation({
    mutationFn: async (clubId: string) => {
      const res = await fetch(`/api/admin/clubs/${clubId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete club")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clubs"] })
      setDeleteTarget(null)
      toast.success("Club deleted")
    },
    onError: () => toast.error("Failed to delete club"),
  })

  const openEdit = (club: AdminClub) => {
    setEditClub(club)
    setEditName(club.name)
    setEditShort(club.short_name || "")
    setEditColor(club.primary_color)
  }

  return (
    <AdminSidebar>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white">Club Management</h1>
                <p className="text-sm text-text-muted mt-1">Manage clubs across the platform</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="relative mb-6">
              <Input
                icon={<Search size={16} />}
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </StaggerItem>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <ClubCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Shield size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-accent-red text-sm">Failed to load clubs.</p>
            </Card>
          ) : data?.clubs.length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Shield size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted text-sm">No clubs found</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {data?.clubs.map((club) => (
                  <StaggerItem key={club.id}>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black shrink-0"
                          style={{ backgroundColor: club.primary_color + "30", color: club.primary_color }}
                        >
                          {club.short_name || club.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{club.name}</span>
                            {club.short_name && (
                              <span className="text-xs text-text-muted">({club.short_name})</span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted">
                            {club.member_count} member{club.member_count !== 1 ? "s" : ""}
                            <span className="mx-1">&middot;</span>
                            <Badge variant={club.visibility === "public" ? "success" : "default"}>
                              {club.visibility}
                            </Badge>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEdit(club)}>
                            <Edit3 size={14} />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(club)}>
                            <Trash2 size={14} />
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

        <Dialog open={!!editClub} onClose={() => setEditClub(null)}>
          <DialogTitle>Edit Club</DialogTitle>
          <DialogDescription>Update club details</DialogDescription>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-muted font-medium block mb-1">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium block mb-1">Short Name</label>
              <Input value={editShort} onChange={(e) => setEditShort(e.target.value)} maxLength={4} />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium block mb-1">Primary Color</label>
              <div className="flex gap-2">
                <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} placeholder="#000000" />
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setEditClub(null)}>Cancel</Button>
            <Button onClick={() => editClub && updateClub.mutate(editClub)} disabled={updateClub.isPending}>
              Save Changes
            </Button>
          </div>
        </Dialog>

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete Club</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteClub.mutate(deleteTarget.id)}
              disabled={deleteClub.isPending}
            >
              Delete
            </Button>
          </div>
        </Dialog>
      </PageTransition>
    </AdminSidebar>
  )
}
