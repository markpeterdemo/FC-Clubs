"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Swords, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface AdminMatch {
  id: string
  home_name: string
  away_name: string
  home_score: number | null
  away_score: number | null
  status: string
  match_date: string
  home_color: string
  away_color: string
}

interface MatchesResponse {
  matches: AdminMatch[]
  total: number
  page: number
  totalPages: number
}

const statusTabs = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
]

function MatchCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-8" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-6 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  )
}

export default function AdminMatches() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [editMatch, setEditMatch] = useState<AdminMatch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminMatch | null>(null)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [matchStatus, setMatchStatus] = useState("scheduled")

  const { data, isLoading, error } = useQuery<MatchesResponse>({
    queryKey: ["admin-matches", page, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (status !== "all") params.set("status", status)
      const res = await fetch(`/api/admin/matches?${params}`)
      if (!res.ok) throw new Error("Failed to fetch matches")
      return res.json()
    },
  })

  const updateMatch = useMutation({
    mutationFn: async (match: AdminMatch) => {
      const body: Record<string, string | number> = {}
      if (homeScore !== String(match.home_score ?? "")) body.home_score = Number(homeScore)
      if (awayScore !== String(match.away_score ?? "")) body.away_score = Number(awayScore)
      if (matchStatus !== match.status) body.status = matchStatus
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to update match")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      setEditMatch(null)
      toast.success("Match updated")
    },
    onError: () => toast.error("Failed to update match"),
  })

  const deleteMatch = useMutation({
    mutationFn: async (matchId: string) => {
      const res = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete match")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      setDeleteTarget(null)
      toast.success("Match deleted")
    },
    onError: () => toast.error("Failed to delete match"),
  })

  const openEdit = (match: AdminMatch) => {
    setEditMatch(match)
    setHomeScore(String(match.home_score ?? ""))
    setAwayScore(String(match.away_score ?? ""))
    setMatchStatus(match.status)
  }

  return (
    <AdminSidebar>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white">Match Management</h1>
                <p className="text-sm text-text-muted mt-1">Oversee and edit matches</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Tabs tabs={statusTabs} active={status} onChange={(id) => { setStatus(id); setPage(1) }} className="mb-6" />
          </StaggerItem>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <MatchCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Swords size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-accent-red text-sm">Failed to load matches.</p>
            </Card>
          ) : data?.matches.length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <Swords size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted text-sm">No matches found</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {data?.matches.map((match) => (
                  <StaggerItem key={match.id}>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: match.home_color }}
                          />
                          <span className="text-sm font-bold text-white truncate">{match.home_name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {match.status === "completed" ? (
                            <span className="text-lg font-black tabular-nums text-white min-w-[3ch] text-center">
                              {match.home_score}
                            </span>
                          ) : (
                            <span className="text-sm text-text-muted min-w-[3ch] text-center">-</span>
                          )}
                          <span className="text-xs text-text-muted font-medium">vs</span>
                          {match.status === "completed" ? (
                            <span className="text-lg font-black tabular-nums text-white min-w-[3ch] text-center">
                              {match.away_score}
                            </span>
                          ) : (
                            <span className="text-sm text-text-muted min-w-[3ch] text-center">-</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-bold text-white truncate">{match.away_name}</span>
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: match.away_color }}
                          />
                        </div>

                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span>{formatDate(match.match_date)}</span>
                            <Badge variant={match.status === "completed" ? "success" : "warning"}>
                              {match.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => openEdit(match)}>
                              <Edit3 size={14} />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setDeleteTarget(match)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
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

        <Dialog open={!!editMatch} onClose={() => setEditMatch(null)}>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update scores and match status
          </DialogDescription>
          {editMatch && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center py-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: editMatch.home_color }}
                />
                <span className="text-sm font-bold text-white">{editMatch.home_name}</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Input
                  type="number"
                  min={0}
                  className="w-20 text-center text-lg font-black"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                />
                <span className="text-xs text-text-muted font-semibold">vs</span>
                <Input
                  type="number"
                  min={0}
                  className="w-20 text-center text-lg font-black"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3 justify-center py-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: editMatch.away_color }}
                />
                <span className="text-sm font-bold text-white">{editMatch.away_name}</span>
              </div>

              <Separator />

              <div>
                <label className="text-xs text-text-muted font-medium block mb-1">Status</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white appearance-none transition-all duration-200 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 cursor-pointer"
                >
                  <option value="scheduled" className="bg-bg-card">Scheduled</option>
                  <option value="completed" className="bg-bg-card">Completed</option>
                </select>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="secondary" onClick={() => setEditMatch(null)}>Cancel</Button>
            <Button onClick={() => editMatch && updateMatch.mutate(editMatch)} disabled={updateMatch.isPending}>
              Save Changes
            </Button>
          </div>
        </Dialog>

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete Match</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this match? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteMatch.mutate(deleteTarget.id)}
              disabled={deleteMatch.isPending}
            >
              Delete
            </Button>
          </div>
        </Dialog>
      </PageTransition>
    </AdminSidebar>
  )
}
