"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Swords, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AdminMatch {
  id: string;
  home_club_id: string;
  away_club_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: "scheduled" | "completed";
  home_name: string;
  home_short: string;
  home_color: string;
  away_name: string;
  away_short: string;
  away_color: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMatch, setEditMatch] = useState<AdminMatch | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [page, statusFilter]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/matches?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(match: AdminMatch) {
    setEditMatch(match);
    setHomeScore(match.home_score?.toString() ?? "");
    setAwayScore(match.away_score?.toString() ?? "");
  }

  async function saveResult() {
    if (!editMatch) return;
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      toast.error("Enter valid scores");
      return;
    }

    try {
      const res = await fetch(`/api/admin/matches/${editMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_score: hs,
          away_score: as,
          status: "completed",
        }),
      });
      if (res.ok) {
        toast.success("Match result saved");
        setEditMatch(null);
        await fetchMatches();
      } else {
        toast.error("Failed to save result");
      }
    } catch {
      toast.error("Failed to save result");
    }
  }

  async function deleteMatch(matchId: string) {
    if (!confirm("Delete this match?")) return;
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Match deleted");
        await fetchMatches();
      }
    } catch {
      toast.error("Failed to delete match");
    }
  }

  const statusOptions = [
    { value: "", label: "All" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <PageTransition>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={statusOptions}
          placeholder="Filter by status"
          className="w-44"
        />
        <span className="text-sm text-text-muted">{total} match{total !== 1 ? "es" : ""}</span>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <StaggerContainer className="space-y-2">
          {matches.map((match) => (
            <StaggerItem key={match.id}>
            <Card
              variant="glass"
              padding="md"
              className="flex items-center gap-4"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: match.home_color }}
                  >
                    {match.home_short}
                  </div>
                  <span className="text-sm font-medium">{match.home_name}</span>
                </div>

                <div className="flex items-center gap-2 text-lg font-bold">
                  {match.status === "completed" ? (
                    <span>
                      {match.home_score} - {match.away_score}
                    </span>
                  ) : (
                    <span className="text-text-muted">vs</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: match.away_color }}
                  >
                    {match.away_short}
                  </div>
                  <span className="text-sm font-medium">{match.away_name}</span>
                </div>

                <Badge variant={match.status === "completed" ? "success" : "info"}>
                  {match.status}
                </Badge>

                <span className="text-xs text-text-muted">
                  {new Date(match.match_date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {match.status === "scheduled" && (
                  <Button variant="secondary" size="sm" onClick={() => openEdit(match)}>
                    <CheckCircle2 size={14} />
                    Enter Result
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMatch(match.id)}
                  className="text-red-400"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
            </StaggerItem>
          ))}
          </StaggerContainer>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog
        open={!!editMatch}
        onClose={() => setEditMatch(null)}
        title="Enter Match Result"
      >
        {editMatch && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: editMatch.home_color }}
                >
                  {editMatch.home_short}
                </div>
                <p className="text-sm font-medium">{editMatch.home_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-16 text-center text-lg"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                />
                <span className="text-lg font-bold">-</span>
                <Input
                  type="number"
                  min="0"
                  className="w-16 text-center text-lg"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                />
              </div>
              <div className="text-center">
                <div
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: editMatch.away_color }}
                >
                  {editMatch.away_short}
                </div>
                <p className="text-sm font-medium">{editMatch.away_name}</p>
              </div>
            </div>
            <Button className="w-full" onClick={saveResult}>
              <Swords size={16} />
              Save Result
            </Button>
          </div>
        )}
      </Dialog>
    </div>
    </PageTransition>
  );
}
