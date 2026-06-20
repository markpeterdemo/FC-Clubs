"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Swords, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
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
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.06}>
        <StaggerItem>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-text-secondary text-sm mt-0.5">Platform overview</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.label} variant="glass" padding="md">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-surface-2/50 p-2.5">
                    <card.icon size={18} className={card.color} />
                  </div>
                  <span className="text-sm text-text-muted">{card.label}</span>
                </div>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`mt-3 text-3xl font-bold tabular-nums ${card.color}`}
                >
                  {card.value}
                </motion.p>
              </Card>
            ))}
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}