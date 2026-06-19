"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface League {
  id: string;
  name: string;
  season: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");

  useEffect(() => {
    fetchLeagues();
  }, []);

  async function fetchLeagues() {
    try {
      const res = await fetch("/api/admin/leagues");
      if (res.ok) {
        setLeagues((await res.json()).leagues);
      }
    } catch {
      toast.error("Failed to fetch leagues");
    } finally {
      setLoading(false);
    }
  }

  async function createLeague() {
    if (!name || !season) {
      toast.error("Name and season are required");
      return;
    }
    try {
      const res = await fetch("/api/admin/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, season }),
      });
      if (res.ok) {
        toast.success("League created");
        setShowCreate(false);
        setName("");
        setSeason("");
        await fetchLeagues();
      }
    } catch {
      toast.error("Failed to create league");
    }
  }

  async function toggleActive(league: League) {
    try {
      const res = await fetch(`/api/admin/leagues/${league.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !league.is_active }),
      });
      if (res.ok) {
        toast.success(league.is_active ? "League deactivated" : "League activated");
        await fetchLeagues();
      }
    } catch {
      toast.error("Failed to update league");
    }
  }

  async function deleteLeague(league: League) {
    if (!confirm(`Delete "${league.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/leagues/${league.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("League deleted");
        await fetchLeagues();
      }
    } catch {
      toast.error("Failed to delete league");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{leagues.length} league{leagues.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New League
        </Button>
      </div>

      <div className="space-y-2">
        {leagues.map((league) => (
          <div
            key={league.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{league.name}</span>
                {league.is_active && (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
              <p className="text-sm text-text-muted">{league.season}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleActive(league)}
            >
              <CheckCircle2 size={16} />
              {league.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteLeague(league)}
              className="text-red-400"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create League"
      >
        <div className="space-y-4">
          <Input label="League Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. Spring 2025" />
          <Button className="w-full" onClick={createLeague}>Create League</Button>
        </div>
      </Dialog>
    </div>
  );
}
