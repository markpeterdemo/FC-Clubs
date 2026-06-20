"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClubs(); }, []);

  async function fetchClubs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/clubs?${params}`);
      if (res.ok) setClubs((await res.json()).clubs);
    } catch { toast.error("Failed to fetch clubs"); }
    finally { setLoading(false); }
  }

  async function deleteClub(id: string) {
    if (!confirm("Delete this club?")) return;
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Club deleted"); fetchClubs(); }
      else { const d = await res.json(); toast.error(d.error || "Failed"); }
    } catch { toast.error("Failed to delete club"); }
  }

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.04}>
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Clubs</h1>
              <p className="text-text-secondary text-sm mt-0.5">Manage all clubs</p>
            </div>
            <span className="text-sm text-text-muted">{clubs.length} clubs</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search clubs..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && fetchClubs()}
            />
          </div>
        </StaggerItem>

        <StaggerItem>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : clubs.length === 0 ? (
            <div className="py-12 text-center text-text-muted">No clubs found</div>
          ) : (
            <div className="space-y-2">
              {clubs.map((club, i) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card variant="glass" padding="sm" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: club.primary_color || "#334155" }}
                      >
                        {club.short_name || club.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{club.name}</p>
                        <p className="text-xs text-text-muted">
                          {club.member_count || 0} members · {club.visibility}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteClub(club.id)} className="text-red-400">
                      <Trash2 size={16} />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}