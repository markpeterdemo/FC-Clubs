"use client";

import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PositionSelect } from "@/components/ui/select";
import { CircularProgress, Progress } from "@/components/ui/progress";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { cn } from "@/lib/utils";
import { Copy, Check, Calendar, Shield, Swords, Crosshair, Settings, Award, Trophy } from "lucide-react";
import { BadgeGrid } from "@/components/badge-grid";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${user.id}` : "";

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

  const gd = stats ? stats.goals_for - stats.goals_against : 0;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.05}>
        {/* Profile Card */}
        <StaggerItem>
          <Card variant="glass" padding="none" className="overflow-hidden">
            <div
              className="h-28"
              style={{
                background: club
                  ? `linear-gradient(135deg, ${club.primary_color}99, ${club.primary_color}22, var(--color-surface))`
                  : "linear-gradient(135deg, #33415544, var(--color-surface))",
              }}
            />

            <div className="relative px-6 pb-6">
              <div className="-mt-14 mb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block rounded-full border-4 border-surface shadow-xl"
                >
                  <DiscordAvatar
                    discordId={user.discord_id}
                    avatarHash={user.avatar}
                    size={88}
                  />
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.global_name || user.username}
                  </h1>
                  <p className="text-sm text-text-muted">@{user.username}</p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                    <Calendar size={12} />
                    Joined {formatDate(user.created_at)}
                  </div>
                </div>

                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                    className="shrink-0"
                  >
                    <Settings size={14} />
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>

              {club && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-5 rounded-xl bg-surface-2/50 border border-border/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white shadow-md"
                      style={{ backgroundColor: club.primary_color || "#22c55e" }}
                    >
                      {club.short_name || club.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{club.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={club.role === "captain" ? "warning" : club.role === "manager" ? "info" : "success"}>
                          {club.role}
                        </Badge>
                        {club.position && <Badge variant="default">{club.position}</Badge>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </StaggerItem>

        {/* Stats */}
        {stats && (
          <StaggerItem>
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-4 mb-5">
                {stats.apps !== undefined && (
                  <CircularProgress
                    value={stats.goals ?? 0}
                    max={Math.max(stats.apps, 1)}
                    size={64}
                    strokeWidth={5}
                    label="Goal Ratio"
                  />
                )}
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {[
                    { label: "Apps", value: stats.apps ?? stats.played, icon: Shield, color: "" },
                    { label: "Goals", value: stats.goals ?? 0, icon: Swords, color: "text-pitch-400" },
                    { label: "Assists", value: stats.assists ?? 0, icon: Crosshair, color: "text-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-surface-2/50 border border-border/50 p-3 text-center transition-all hover:bg-surface-2">
                      <s.icon size={16} className={cn("mx-auto mb-1", s.color || "text-text-muted")} />
                      <motion.p
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={cn("text-xl font-bold tabular-nums", s.color)}
                      >
                        {s.value}
                      </motion.p>
                      <p className="text-xs text-text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-text-muted mb-2">Club Record</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-pitch-400 font-medium">{stats.wins}W</span>
                    <span className="text-text-muted">{stats.draws}D</span>
                    <span className="text-red-400 font-medium">{stats.losses}L</span>
                    <span className={cn("font-semibold tabular-nums", gd > 0 ? "text-pitch-400" : gd < 0 ? "text-red-400" : "")}>
                      GD {gd > 0 ? `+${gd}` : gd}
                    </span>
                  </div>
                  <Progress
                    value={stats.played ? (stats.wins / stats.played) * 100 : 0}
                    variant="success"
                    size="sm"
                    className="flex-1 max-w-[120px]"
                    showLabel
                    label="Win Rate"
                  />
                </div>
              </div>
            </Card>
          </StaggerItem>
        )}

        {/* Badges */}
        <StaggerItem>
          <BadgeGrid userId={user.id} />
        </StaggerItem>

        {/* Edit Profile */}
        {isOwnProfile && editing && (
          <StaggerItem>
            <Card variant="glass" padding="md">
              <h4 className="text-sm font-semibold mb-4">Profile Settings</h4>
              <div className="space-y-4">
                <PositionSelect value={position} onChange={setPosition} label="Position" />
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={(e) => setPublicProfile(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-surface-3 accent-pitch-500"
                  />
                  Public profile
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="premium" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </StaggerItem>
        )}

        {/* Share */}
        <StaggerItem>
          <Button
            variant="secondary"
            className="w-full"
            onClick={copyProfileLink}
          >
            {copied ? (
              <><Check size={16} className="text-pitch-400" /> Copied!</>
            ) : (
              <><Copy size={16} /> Copy Profile Link</>
            )}
          </Button>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}