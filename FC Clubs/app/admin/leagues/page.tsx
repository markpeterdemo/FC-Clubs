"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Trophy, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface AdminLeague {
  id: string
  name: string
  season: string
  is_active: boolean
  start_date: string | null
  end_date: string | null
}

function LeagueCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  )
}

export default function AdminLeagues() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminLeague | null>(null)
  const [newName, setNewName] = useState("")
  const [newSeason, setNewSeason] = useState("")

  const { data, isLoading, error } = useQuery<{ leagues: AdminLeague[] }>({
    queryKey: ["admin-leagues"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leagues")
      if (!res.ok) throw new Error("Failed to fetch leagues")
      return res.json()
    },
  })

  const createLeague = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, season: newSeason }),
      })
      if (!res.ok) throw new Error("Failed to create league")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leagues"] })
      setShowCreate(false)
      setNewName("")
      setNewSeason("")
      toast.success("League created")
    },
    onError: () => toast.error("Failed to create league"),
  })

  const toggleActive = useMutation({
    mutationFn: async (league: AdminLeague) => {
      const res = await fetch(`/api/admin/leagues/${league.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !league.is_active }),
      })
      if (!res.ok) throw new Error("Failed to update league")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leagues"] })
      toast.success("League status updated")
    },
    onError: () => toast.error("Failed to update league"),
  })

  const deleteLeague = useMutation({
    mutationFn: async (leagueId: string) => {
      const res = await fetch(`/api/admin/leagues/${leagueId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete league")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leagues"] })
      setDeleteTarget(null)
      toast.success("League deleted")
    },
    onError: () => toast.error("Failed to delete league"),
  })

  return (
    <AdminSidebar>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white">League Management</h1>
                <p className="text-sm text-text-muted mt-1">Create and manage seasons</p>
              </div>
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Create League
              </Button>
            </div>
          </StaggerItem>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <LeagueCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Trophy size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-accent-red text-sm">Failed to load leagues.</p>
            </Card>
          ) : !data?.leagues.length ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Trophy size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted text-sm mb-4">No leagues created yet</p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Create League
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.leagues.map((league) => (
                <StaggerItem key={league.id}>
                  <Card
                    className={`p-5 relative overflow-hidden ${league.is_active ? "ring-1 ring-accent-green/40" : ""}`}
                  >
                    {league.is_active && (
                      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
                        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-accent-green animate-pulse" />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{league.name}</h3>
                        <p className="text-xs text-text-muted">{league.season}</p>
                      </div>
                      <Badge variant={league.is_active ? "success" : "default"}>
                        {league.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {(league.start_date || league.end_date) && (
                      <p className="text-xs text-text-muted mb-3">
                        {league.start_date && formatDate(league.start_date)}
                        {league.start_date && league.end_date && " — "}
                        {league.end_date && formatDate(league.end_date)}
                      </p>
                    )}
                    <Separator className="mb-3" />
                    <div className="flex items-center gap-2">
                      <Button
                        variant={league.is_active ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => toggleActive.mutate(league)}
                        disabled={toggleActive.isPending}
                      >
                        <CheckCircle2 size={14} />
                        {league.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(league)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          )}
        </StaggerContainer>

        <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
          <DialogTitle>Create League</DialogTitle>
          <DialogDescription>Set up a new league season</DialogDescription>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-muted font-medium block mb-1">League Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Spring Championship"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium block mb-1">Season</label>
              <Input
                value={newSeason}
                onChange={(e) => setNewSeason(e.target.value)}
                placeholder="e.g. Spring 2025"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createLeague.mutate()}
              disabled={!newName || !newSeason || createLeague.isPending}
            >
              Create
            </Button>
          </div>
        </Dialog>

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete League</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteLeague.mutate(deleteTarget.id)}
              disabled={deleteLeague.isPending}
            >
              Delete
            </Button>
          </div>
        </Dialog>
      </PageTransition>
    </AdminSidebar>
  )
}
