"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Search, Shield, ShieldOff, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by username, name, or Discord ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit">
          <Search size={16} />
          Search
        </Button>
      </form>

      <p className="text-sm text-text-muted">{total} user{total !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <DiscordAvatar discordId={user.discord_id} avatarHash={user.avatar} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.global_name || user.username}</span>
                  {user.is_admin && <Badge variant="warning">Admin</Badge>}
                  {user.banned && <Badge variant="danger">Banned</Badge>}
                </div>
                <p className="text-sm text-text-muted">@{user.username}</p>
                {user.club_name && (
                  <p className="text-xs text-text-muted">
                    {user.club_role} of {user.club_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAdmin(user)}
                  disabled={updating}
                >
                  {user.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                  {user.is_admin ? "Remove Admin" : "Make Admin"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBan(user)}
                  disabled={updating}
                  className={user.banned ? "text-pitch-400" : "text-red-400"}
                >
                  {user.banned ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                  {user.banned ? "Unban" : "Ban"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
