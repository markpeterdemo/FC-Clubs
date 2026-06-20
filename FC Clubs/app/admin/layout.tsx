"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Users,
  Shield,
  Swords,
  Trophy,
  ArrowLeft,
  Goal,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/clubs", label: "Clubs", icon: Shield },
  { href: "/admin/matches", label: "Matches", icon: Swords },
  { href: "/admin/leagues", label: "Leagues", icon: Trophy },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="flex gap-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary transition-all duration-200 hover:bg-surface-2/50 hover:text-text-primary"
          >
            <ArrowLeft size={16} />
            Back to App
          </Link>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-pitch-500/10 text-pitch-400 border border-pitch-500/20"
                    : "text-text-secondary hover:bg-surface-2/50 hover:text-text-primary border border-transparent"
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-700 shadow-lg shadow-pitch-500/20">
            <Goal size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-text-secondary">Site-wide management</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}