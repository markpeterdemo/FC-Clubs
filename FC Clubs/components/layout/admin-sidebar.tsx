"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Shield,
  Swords,
  Trophy,
  ChevronLeft,
} from "lucide-react"

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/clubs", label: "Clubs", icon: Shield },
  { href: "/admin/matches", label: "Matches", icon: Swords },
  { href: "/admin/leagues", label: "Leagues", icon: Trophy },
]

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 bottom-0 bg-bg-card border-r border-white/5 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-8 transition-colors">
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>

        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-3">
          Admin Panel
        </h2>

        <nav className="space-y-1 flex-1">
          {adminLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  active
                    ? "bg-accent-green/10 text-accent-green"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {link.label}
                {active && <div className="ml-auto w-1.5 h-5 rounded-full bg-accent-green" />}
              </Link>
            )
          })}
        </nav>

        <div className="text-xs text-text-muted">
          Matchday Admin v1.0
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
