"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";

interface Invite {
  id: string;
  club_name: string;
  club_short: string;
  club_color: string;
  sender_name: string;
  sender_global: string | null;
  message: string | null;
  created_at: string;
  status: string;
}

export default function InvitesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchInvites();
  }, [user]);

  async function fetchInvites() {
    try {
      const res = await fetch("/api/invites");
      if (res.ok) {
        setInvites((await res.json()).invites);
      }
    } catch {
      toast.error("Failed to fetch invites");
    } finally {
      setLoadingInvites(false);
    }
  }

  async function respond(inviteId: string, status: "accepted" | "declined") {
    try {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === "accepted" ? "Joined club!" : "Invite declined");
        await fetchInvites();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to respond");
      }
    } catch {
      toast.error("Failed to respond to invite");
    }
  }

  if (loading || loadingInvites) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Mail size={24} className="text-pitch-400" />
        <div>
          <h1 className="text-2xl font-bold">Club Invites</h1>
          <p className="text-sm text-text-secondary">Manage your pending club invitations</p>
        </div>
      </div>

      {invites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <Mail size={40} className="text-text-muted" />
          <p className="text-text-secondary">No pending invites</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: invite.club_color }}
                >
                  {invite.club_short || invite.club_name.slice(0, 3).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{invite.club_name}</h3>
                  <p className="text-sm text-text-muted">
                    Invited by {invite.sender_global || invite.sender_name}
                  </p>
                  {invite.message && (
                    <p className="mt-1 text-sm italic text-text-secondary">"{invite.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => respond(invite.id, "accepted")}
                  >
                    <CheckCircle2 size={14} />
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => respond(invite.id, "declined")}
                  >
                    <XCircle size={14} />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
