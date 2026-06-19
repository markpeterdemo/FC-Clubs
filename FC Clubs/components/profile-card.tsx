"use client";

import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PositionSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Copy, Check, Calendar, Shield, Swords, Crosshair, Settings, Award } from "lucide-react";
import { BadgeGrid } from "@/components/badge-grid";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileCardProps {
  user: {
    id: string;
    discord_id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    position: string | null;
    public_profile?: boolean;
    created_at: string;
  };
  club: {
    id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
    primary_color: string;
    role: string;
    position: string | null;
    joined_at: string;
  } | null;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goals?: number;
    assists?: number;
    apps?: number;
    yellow_cards?: number;
    red_cards?: number;
  } | null;
  isOwnProfile?: boolean;
}

export function ProfileCard({ user, club, stats, isOwnProfile }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState(user.position || "");
  const [publicProfile, setPublicProfile] = useState(user.public_profile ?? true);
  const [saving, setSaving] = useState(false);

  const profileUrl = `${window.location.origin}/profile/${user.id}`;

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: position || null, public_profile: publicProfile }),
      });
      if (res.ok) {
        toast.success("Profile updated");
        setEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function copyProfileLink() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        {/* Top gradient accent */}
        <div
          className="h-24 rounded-t-xl"
          style={{
            background: club
              ? `linear-gradient(135deg, ${club.primary_color}88, ${club.primary_color}22)`
              : "linear-gradient(135deg, #334155, #1e293b)",
          }}
        />

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <div className="inline-block rounded-full border-4 border-card">
              <DiscordAvatar
                discordId={user.discord_id}
                avatarHash={user.avatar}
                size={88}
              />
            </div>
          </div>

          {/* Name & Username */}
          <h1 className="text-2xl font-bold">
            {user.global_name || user.username}
          </h1>
          <p className="text-sm text-text-muted">@{user.username}</p>

          {/* Club Info */}
          {club && (
            <div className="mt-4 rounded-lg bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white"
                  style={{ backgroundColor: club.primary_color || "#22c55e" }}
                >
                  {club.short_name || club.name.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{club.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge
                      variant={club.role === "captain" ? "warning" : club.role === "manager" ? "info" : "default"}
                    >
                      {club.role}
                    </Badge>
                    {club.position && <Badge>{club.position}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold text-text-secondary">Player Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Apps", value: stats.apps ?? stats.played, icon: Shield },
                  { label: "Goals", value: stats.goals ?? 0, icon: Swords },
                  { label: "Assists", value: stats.assists ?? 0, icon: Crosshair },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-surface-2 p-3 text-center"
                  >
                    <s.icon size={16} className="mx-auto mb-1 text-text-muted" />
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Club Record */}
              <div className="mt-3 rounded-lg bg-surface-2 p-3">
                <p className="text-xs text-text-muted mb-1">Club Record This Season</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pitch-400">{stats.wins}W</span>
                  <span className="text-text-muted">{stats.draws}D</span>
                  <span className="text-red-400">{stats.losses}L</span>
                  <span className="text-text-secondary">
                    GD {stats.goals_for - stats.goals_against > 0
                      ? `+${stats.goals_for - stats.goals_against}`
                      : stats.goals_for - stats.goals_against}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          <BadgeGrid userId={user.id} className="mt-4" />

          {/* Member since */}
          <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
            <Calendar size={12} />
            Joined {formatDate(user.created_at)}
          </div>

          {isOwnProfile && !editing && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setEditing(true)}
            >
              <Settings size={14} />
              Edit Profile
            </Button>
          )}

          {isOwnProfile && editing && (
            <div className="mt-4 space-y-4 rounded-lg border border-border bg-surface-2 p-4">
              <h4 className="text-sm font-semibold">Profile Settings</h4>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Position
                </label>
                <PositionSelect value={position} onChange={setPosition} />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface-3 accent-pitch-500"
                />
                Public profile
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Profile Button */}
      <Button
        variant="secondary"
        className="w-full"
        onClick={copyProfileLink}
      >
        {copied ? (
          <>
            <Check size={16} className="text-pitch-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Profile Link
          </>
        )}
      </Button>

      {copied && (
        <p className="text-center text-sm text-pitch-400 animate-fade-in">
          Profile link copied — paste it anywhere to share!
        </p>
      )}
    </div>
  );
}
