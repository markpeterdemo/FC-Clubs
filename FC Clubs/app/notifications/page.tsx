"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  Bell,
  UserPlus,
  Mail,
  Check,
  X,
  Calendar,
  Swords,
  CheckCheck,
} from "lucide-react";

const typeIcons: Record<string, any> = {
  invite: Mail,
  join_request: UserPlus,
  match_reminder: Calendar,
  match_result: Swords,
};

const typeColors: Record<string, string> = {
  invite: "text-blue-400 bg-blue-900/30",
  join_request: "text-yellow-400 bg-yellow-900/30",
  match_reminder: "text-pitch-400 bg-pitch-900/30",
  match_result: "text-purple-400 bg-purple-900/30",
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchNotifications();
  }, []);

  async function markAsRead(notifId: string) {
    try {
      await fetch(`/api/notifications/${notifId}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch {
      // ignore
    }
  }

  if (loading) return null;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-text-secondary">Stay up to date with your club</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm text-pitch-400 transition-colors hover:text-pitch-300"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
          <Bell size={20} className="text-text-muted" />
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell size={40} className="mb-3 text-text-muted" />
          <p className="text-text-secondary">No notifications yet</p>
          <p className="text-sm text-text-muted">Activity will appear here</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {notifications.map((notif: any) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || "text-text-muted bg-surface-2";
            const isUnread = !notif.read_at;

            return (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  isUnread ? "bg-pitch-900/10" : "hover:bg-surface-2"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    colorClass
                  )}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", isUnread && "font-medium")}>
                    {notif.message}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatDate(notif.created_at)}
                  </p>
                </div>

                {isUnread && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pitch-500 transition-colors hover:bg-pitch-400"
                    title="Mark as read"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
