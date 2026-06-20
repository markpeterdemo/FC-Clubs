"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Users, Shield, Swords, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface AdminStats {
  users: number
  clubs: number
  matches: number
  completed_matches: number
}

const statCards = [
  { key: "users" as const, label: "Total Users", icon: Users, gradient: "from-blue-500/20 to-blue-600/10", iconBg: "bg-blue-500/20 text-blue-400" },
  { key: "clubs" as const, label: "Total Clubs", icon: Shield, gradient: "from-green-500/20 to-green-600/10", iconBg: "bg-green-500/20 text-green-400" },
  { key: "matches" as const, label: "Total Matches", icon: Swords, gradient: "from-purple-500/20 to-purple-600/10", iconBg: "bg-purple-500/20 text-purple-400" },
  { key: "completed_matches" as const, label: "Completed", icon: CheckCircle2, gradient: "from-amber-500/20 to-amber-600/10", iconBg: "bg-amber-500/20 text-amber-400" },
]

function StatCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
  })

  return (
    <AdminSidebar>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
            <p className="text-sm text-text-muted mb-8">Overview of the Matchday FC platform</p>
          </StaggerItem>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card variant="elevated" padding="lg" className="text-center">
              <p className="text-accent-red text-sm">Failed to load dashboard stats. Please try again later.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon
                const value = data?.[stat.key] ?? 0
                return (
                  <StaggerItem key={stat.key}>
                    <Card className="p-4 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
                      <div className="relative flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <p className="text-xs text-text-muted font-medium">{stat.label}</p>
                          <motion.p
                            className="text-3xl font-black text-white"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            {value.toLocaleString()}
                          </motion.p>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                )
              })}
            </div>
          )}
        </StaggerContainer>
      </PageTransition>
    </AdminSidebar>
  )
}
