"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PositionSelect } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Users,
  Shield,
  UserX,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function ClubSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [visibility, setVisibility] = useState("public");
  const [maxMembers, setMaxMembers] = useState(20);
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [clubRes, membersRes, requestsRes] = await Promise.all([
          fetch(`/api/clubs/${id}`),
          fetch(`/api/clubs/${id}/members`),
          fetch(`/api/join-requests`),
        ]);

        if (clubRes.ok) {
          const data = await clubRes.json();
          setClub(data.club);
          setName(data.club.name);
          setShortName(data.club.short_name || "");
          setColor(data.club.primary_color || "#22c55e");
          setVisibility(data.club.visibility || "public");
          setMaxMembers(data.club.max_members || 20);
          setDescription(data.club.description || "");
        }

        if (membersRes.ok) {
          const data = await membersRes.json();
          setMembers(data.members);

          const currentMember = data.members.find(
            (m: any) => m.user_id === user?.id
          );
          if (!currentMember || (currentMember.role !== "captain" && currentMember.role !== "manager")) {
            router.push(`/clubs/${id}`);
          }
        }

        if (requestsRes.ok) {
          const data = await requestsRes.json();
          setJoinRequests(data.requests || []);
          setPendingRequests(data.requests?.filter((r: any) => r.status === "pending") || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [id, user, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          short_name: shortName,
          primary_color: color,
          visibility,
          max_members: maxMembers,
          description,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Club settings saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleKick(memberId: string) {
    try {
      const res = await fetch(`/api/clubs/${id}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove member");
      toast.success("Member removed");
      setMembers((prev: any[]) => prev.filter((m) => m.user_id !== memberId));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleRequestAction(requestId: string, action: "approved" | "declined") {
    try {
      const res = await fetch(`/api/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) throw new Error("Failed to process");

      toast.success(action === "approved" ? "Request approved" : "Request declined");
      setPendingRequests((prev) => prev.filter((r: any) => r.id !== requestId));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function generateInviteCode() {
    const code = `${shortName || "CLUB"}-JOIN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setInviteCode(code);
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  if (!club) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          href={`/clubs/${id}`}
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Club Settings</h1>
          <p className="text-text-secondary">{club.name}</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">General</h2>
        <div className="space-y-4">
          <Input label="Club Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Short Name"
            value={shortName}
            onChange={(e) => setShortName(e.target.value.toUpperCase())}
            className="max-w-[120px]"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Club Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent"
              />
              <span className="text-sm text-text-muted">{color}</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell players about your club..."
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500/50 min-h-[80px] resize-y"
            />
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Club Visibility</h2>
        <div className="space-y-3">
          {[
            {
              value: "public",
              label: "Public",
              desc: "Anyone can join freely",
              icon: Eye,
            },
            {
              value: "private",
              label: "Private",
              desc: "Players request to join, you approve",
              icon: EyeOff,
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setVisibility(option.value)}
              className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                visibility === option.value
                  ? "border-pitch-600 bg-pitch-900/20"
                  : "border-border hover:bg-surface-2"
              }`}
            >
              <option.icon
                size={20}
                className={visibility === option.value ? "text-pitch-400" : "text-text-muted"}
              />
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-text-muted">{option.desc}</p>
              </div>
              {visibility === option.value && (
                <Check size={18} className="ml-auto text-pitch-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Join Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-2">
            {pendingRequests.map((req: any) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg bg-surface-2 p-3"
              >
                <div className="flex items-center gap-3">
                  <DiscordAvatar
                    discordId={req.discord_id}
                    avatarHash={req.avatar}
                    size={36}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {req.global_name || req.username}
                    </p>
                    {req.position && (
                      <Badge className="text-[10px]">{req.position}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRequestAction(req.id, "declined")}
                  >
                    <X size={14} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRequestAction(req.id, "approved")}
                  >
                    <Check size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Members ({members.length})</h2>
          <Users size={16} className="text-text-muted" />
        </div>

        <div className="space-y-2">
          {members.map((member: any) => (
            <div
              key={member.user_id}
              className="flex items-center justify-between rounded-lg bg-surface-2 p-3"
            >
              <div className="flex items-center gap-3">
                <DiscordAvatar
                  discordId={member.discord_id}
                  avatarHash={member.avatar}
                  size={36}
                />
                <div>
                  <p className="text-sm font-medium">
                    {member.global_name || member.username}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        member.role === "captain"
                          ? "warning"
                          : member.role === "manager"
                          ? "info"
                          : "default"
                      }
                      className="text-[10px]"
                    >
                      {member.role}
                    </Badge>
                    {member.position && (
                      <Badge className="text-[10px]">{member.position}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {member.user_id !== user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleKick(member.user_id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <UserX size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Code */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Invite Players</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={generateInviteCode}>
            Generate Code
          </Button>
          {inviteCode && (
            <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <code className="text-sm font-mono text-pitch-400">{inviteCode}</code>
              <button
                onClick={copyInviteCode}
                className="rounded p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                {copied ? <Check size={14} className="text-pitch-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Share this code with players to invite them to your club
        </p>
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
