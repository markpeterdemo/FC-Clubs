"use client"

import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/auth-context"
import { Logo } from "@/components/ui/logo"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverItem } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Trophy,
  Users,
  BarChart3,
  Bell,
  Mail,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Swords,
  Medal,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/players", label: "Players", icon: Users },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/rankings", label: "Rankings", icon: Medal },
  { href: "/team-of-the-week", label: "TOTW", icon: Swords },
]

export function Nav() {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) {
    return (
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="w-9 h-9 rounded-full bg-white/5 animate-shimmer" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={user ? "/dashboard" : "/"}>
            <Logo size="sm" />
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      active
                        ? "bg-accent-green/10 text-accent-green"
                        : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                    )}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={18} />
                </Button>
              </Link>
              <Link href="/invites">
                <Button variant="ghost" size="sm" className="relative">
                  <Mail size={18} />
                </Button>
              </Link>
              <Popover
                trigger={
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                    <Avatar
                      name={user.global_name || user.username}
                      src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=64` : null}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {user.global_name || user.username}
                    </span>
                  </button>
                }
                align="end"
              >
                <PopoverItem onClick={() => window.location.href = `/profile/${user.id}`}>
                  <User size={16} /> Profile
                </PopoverItem>
                {user.is_admin && (
                  <PopoverItem onClick={() => window.location.href = "/admin"}>
                    <Shield size={16} /> Admin Panel
                  </PopoverItem>
                )}
                <div className="h-px bg-white/5 my-1" />
                <PopoverItem onClick={logout}>
                  <LogOut size={16} /> Sign Out
                </PopoverItem>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t border-white/5 bg-bg-primary/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                    active
                      ? "bg-accent-green/10 text-accent-green"
                      : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
