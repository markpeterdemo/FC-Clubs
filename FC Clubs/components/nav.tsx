"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Swords,
  Trophy,
  Bell,
  LogOut,
  Menu,
  X,
  Goal,
  Shield,
  Mail,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/players", label: "Players", icon: Users },
  { href: "/stats", label: "Stats", icon: Swords },
];

export function Nav() {
  const { user, loading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <header className="sticky top-0 z-40 border-b border-border glass-strong">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border glass-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pitch-500 to-pitch-700 shadow-lg shadow-pitch-500/20 transition-all duration-300 group-hover:shadow-pitch-500/40 group-hover:scale-105">
              <Goal size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Matchday</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-pitch-500/10 text-pitch-400 shadow-sm shadow-pitch-500/5"
                      : "text-text-secondary hover:bg-surface-2/50 hover:text-text-primary"
                  )}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-2/60 hover:text-text-primary transition-all duration-200"
              >
                <Bell size={20} />
              </Link>

              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-surface-2/60 transition-all duration-200">
                    <DiscordAvatar
                      discordId={user.discord_id}
                      avatarHash={user.avatar}
                      size={32}
                    />
                    <span className="hidden text-sm font-medium sm:block">
                      {user.global_name || user.username}
                    </span>
                  </button>
                }
                align="right"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <p className="text-sm font-medium text-text-primary">
                    {user.global_name || user.username}
                  </p>
                  <p className="text-xs text-text-muted">@{user.username}</p>
                </div>
                <DropdownItem onClick={() => window.location.href = `/profile/${user.id}`}>
                  <Users size={16} />
                  My Profile
                </DropdownItem>
                <DropdownItem onClick={() => window.location.href = "/invites"}>
                  <Mail size={16} />
                  Invites
                </DropdownItem>
                {isAdmin && (
                  <DropdownItem onClick={() => window.location.href = "/admin"}>
                    <Shield size={16} />
                    Admin Panel
                  </DropdownItem>
                )}
                <DropdownItem onClick={logout} danger>
                  <LogOut size={16} />
                  Sign Out
                </DropdownItem>
              </Dropdown>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface-2/60 md:hidden transition-all duration-200"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-discord to-discord-hover px-4 py-2 text-sm font-medium text-white shadow-lg shadow-discord/20 hover:shadow-discord/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Sign in with Discord
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border glass-strong px-4 py-3 md:hidden animate-slide-down">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-pitch-500/10 text-pitch-400"
                      : "text-text-secondary hover:bg-surface-2/50"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
