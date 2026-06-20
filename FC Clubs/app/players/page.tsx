"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { DiscordAvatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Send,
  ChevronDown,
  UserPlus,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { POSITION_GROUPS, type Position } from "@/lib/types";

export default function PlayersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [clubFilter, setClubFilter] = useState("all");
  const [players, setPlayers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [inviteTarget, setInviteTarget] = useState<any>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedPositions.length) params.set("positions", selectedPositions.join(","));
        if (clubFilter !== "all") params.set("club_id", clubFilter);

        const [playersRes, clubsRes] = await Promise.all([
          fetch(`/api/players?${params}`),
          fetch("/api/clubs?all=true"),
        ]);

        if (playersRes.ok) {
          const data = await playersRes.json();
          setPlayers(data.players);
        }
        if (clubsRes.ok) {
          const data = await clubsRes.json();
          setClubs(data.clubs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlayers(false);
      }
    }

    fetchPlayers();
  }, [query, selectedPositions, clubFilter]);

  async function handleInvite() {
    if (!inviteTarget || !inviteMessage.trim()) return;
    setSendingInvite(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: inviteTarget.id, message: inviteMessage }),
      });
      if (res.ok) {
        toast.success("Invite sent!");
        setInviteTarget(null);
        setInviteMessage("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  }

  function togglePosition(pos: string) {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  const activeFilters = selectedPositions.length + (clubFilter !== "all" ? 1 : 0);

  if (loading || loadingPlayers) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6" staggerDelay={0.04}>
        <StaggerItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Players</h1>
              <p className="text-text-secondary text-sm mt-0.5">Find and connect with other players</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
              className="relative"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pitch-500 text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>
        </StaggerItem>

        {/* Search + Filters */}
        <StaggerItem>
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players by name..."
                className="w-full rounded-xl border border-border bg-surface-2/50 pl-9 pr-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-pitch-500/50 focus:outline-none focus:ring-2 focus:ring-pitch-500/15 transition-all duration-200 backdrop-blur-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  <X size={16} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <Card variant="glass" padding="sm" className="space-y-4">
                    {/* Position filter */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Position</p>
                      <div className="flex flex-wrap gap-1.5">
                        {POSITION_GROUPS.map((group) => {
                          const hasSelected = group.positions.some((p) => selectedPositions.includes(p));
                          const isExpanded = expandedGroup === group.label;
                          return (
                            <div key={group.label} className="relative">
                              <button
                                onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                                className={cn(
                                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all",
                                  hasSelected
                                    ? "bg-pitch-500/10 border-pitch-500/30 text-pitch-400"
                                    : "bg-surface-2/50 border-border text-text-secondary hover:border-border-light"
                                )}
                              >
                                {group.label}
                                <ChevronDown size={12} className={cn("transition-transform", isExpanded && "rotate-180")} />
                              </button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 mt-1 z-10 flex gap-1 flex-wrap p-2 rounded-xl border border-border glass shadow-elevated min-w-[180px]"
                                  >
                                    {group.positions.map((pos) => (
                                      <button
                                        key={pos}
                                        onClick={() => togglePosition(pos)}
                                        className={cn(
                                          "px-2 py-1 rounded-md text-xs font-medium transition-all",
                                          selectedPositions.includes(pos)
                                            ? "bg-pitch-500/20 text-pitch-400"
                                            : "text-text-secondary hover:bg-surface-2/50"
                                        )}
                                      >
                                        {pos}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Club filter */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Club</p>
                      <select
                        value={clubFilter}
                        onChange={(e) => setClubFilter(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-2/50 px-3 py-2 text-sm text-text-primary focus:border-pitch-500/50 focus:outline-none focus:ring-2 focus:ring-pitch-500/15 transition-all"
                      >
                        <option value="all">All Clubs</option>
                        {clubs.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {(selectedPositions.length > 0 || clubFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedPositions([]); setClubFilter("all"); }}
                        className="text-xs"
                      >
                        <X size={12} />
                        Clear all filters
                      </Button>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StaggerItem>

        {/* Player grid */}
        <StaggerItem>
          {players.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto mb-3 text-text-muted" />
              <p className="text-text-muted">No players found</p>
              <p className="text-xs text-text-muted mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player: any, i: number) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card variant="glass" padding="sm" hover className="h-full" onClick={() => router.push(`/profile/${player.id}`)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <DiscordAvatar
                          discordId={player.discord_id}
                          avatarHash={player.avatar}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {player.global_name || player.username}
                          </p>
                          <p className="text-xs text-text-muted truncate">@{player.username}</p>
                        </div>
                      </div>
                      <Badge variant={player.club ? "success" : "default"} className="shrink-0">
                        {player.club?.short_name || "Free Agent"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {player.position && <Badge variant="info">{player.position}</Badge>}
                      {player.club && (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: player.club.primary_color }}
                          />
                          {player.club.name}
                        </div>
                      )}
                    </div>

                    {player.stats && (
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
                        <div className="text-center">
                          <p className="text-xs text-text-muted">Apps</p>
                          <p className="text-sm font-semibold tabular-nums">{player.stats.appearances || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted">Goals</p>
                          <p className="text-sm font-semibold tabular-nums text-pitch-400">{player.stats.goals || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted">Assists</p>
                          <p className="text-sm font-semibold tabular-nums text-blue-400">{player.stats.assists || 0}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteTarget(player);
                          setInviteMessage("");
                        }}
                      >
                        <UserPlus size={14} />
                        Invite
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </StaggerItem>
      </StaggerContainer>

      {/* Invite Dialog */}
      <Dialog
        open={!!inviteTarget}
        onClose={() => { setInviteTarget(null); setInviteMessage(""); }}
        title={`Invite ${inviteTarget?.global_name || inviteTarget?.username || ""}`}
      >
        <div className="space-y-4">
          <textarea
            value={inviteMessage}
            onChange={(e) => setInviteMessage(e.target.value)}
            placeholder="Write a personal message..."
            rows={3}
            className="w-full rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-pitch-500/50 focus:outline-none focus:ring-2 focus:ring-pitch-500/15 transition-all resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setInviteTarget(null)}>Cancel</Button>
            <Button
              variant="premium"
              size="sm"
              onClick={handleInvite}
              disabled={!inviteMessage.trim() || sendingInvite}
            >
              <Send size={14} />
              {sendingInvite ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </Dialog>
    </PageTransition>
  );
}