"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Search, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface AdminClub {
  id: string;
  name: string;
  short_name: string | null;
  primary_color: string;
  visibility: string;
  description: string | null;
  member_count: number;
  created_at: string;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, [page]);

  async function fetchClubs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/clubs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to fetch clubs");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchClubs();
  }

  async function deleteClub(clubId: string, clubName: string) {
    if (!confirm(`Delete "${clubName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Club deleted");
        await fetchClubs();
      }
    } catch {
      toast.error("Failed to delete club");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search clubs by name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit">
          <Search size={16} />
          Search
        </Button>
      </form>

      <p className="text-sm text-text-muted">{total} club{total !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
          </div>
        ) : (
          clubs.map((club) => (
            <div
              key={club.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: club.primary_color }}
              >
                {club.short_name || club.name.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{club.name}</span>
                  <Badge variant={club.visibility === "public" ? "success" : "info"}>
                    {club.visibility}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted">
                  {club.member_count} member{club.member_count !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteClub(club.id, club.name)}
                className="text-red-400"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          ))
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
    </div>
  );
}
