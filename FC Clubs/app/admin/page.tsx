"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Swords, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Total Clubs", value: stats?.totalClubs ?? 0, icon: Shield, color: "text-pitch-400" },
    { label: "Total Matches", value: stats?.totalMatches ?? 0, icon: Swords, color: "text-gold" },
    { label: "Completed", value: stats?.completedMatches ?? 0, icon: CheckCircle2, color: "text-pitch-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <card.icon size={18} className={card.color} />
              <span className="text-sm text-text-muted">{card.label}</span>
            </div>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
