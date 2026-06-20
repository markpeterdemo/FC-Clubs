"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DiscordAvatar } from "@/components/ui/avatar";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Shield, ShieldOff, Ban, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AdminUser {
  id: string;
  discord_id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  is_admin: boolean;
  banned: boolean;
  created_at: string;
  club_role: string | null;
  club_name: string | null;
  club_id: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  }

  async function toggleAdmin(user: AdminUser) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !user.is_admin }),
      });
      if (res.ok) {
        toast.success(user.is_admin ? "Admin removed" : "Admin granted");
        await fetchUsers();
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdating(false);
    }
  }

  async function toggleBan(user: AdminUser) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned }),
      });
      if (res.ok) {
        toast.success(user.banned ? "User unbanned" : "User banned");
        await fetchUsers();
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.04}>
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-text-secondary text-sm mt-0.5">Manage platform users</p>
            </div>
            <span className="text-sm text-text-muted">{total} total</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search by username, name, or Discord ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="primary">Search</Button>
          </form>
        </StaggerItem>

        <StaggerItem>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <Card variant="glass" padding="sm" className="flex items-center gap-4">
                    <DiscordAvatar discordId={u.discord_id} avatarHash={u.avatar} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{u.global_name || u.username}</span>
                        {u.is_admin && <Badge variant="warning">Admin</Badge>}
                        {u.banned && <Badge variant="danger">Banned</Badge>}
                      </div>
                      <p className="text-xs text-text-muted">@{u.username}</p>
                      {u.club_name && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {u.club_role} of {u.club_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => toggleAdmin(u)} disabled={updating}>
                        {u.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                        <span className="hidden sm:inline">{u.is_admin ? "Remove Admin" : "Make Admin"}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBan(u)}
                        disabled={updating}
                        className={u.banned ? "text-pitch-400" : "text-red-400"}
                      >
                        {u.banned ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        <span className="hidden sm:inline">{u.banned ? "Unban" : "Ban"}</span>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </StaggerItem>

        {totalPages > 1 && (
          <StaggerItem>
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
                Previous
              </Button>
              <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </StaggerItem>
        )}
      </StaggerContainer>
    </PageTransition>
  );
}