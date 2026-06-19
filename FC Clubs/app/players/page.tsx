"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  X,
  Send,
  MessageSquare,
  Shield,
  ChevronDown,
  UserPlus,
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
          fetch("/api/clubs"),
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

  function togglePosition(pos: string) {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  function toggleGroup(groupLabel: string) {
    setExpandedGroup((prev) => (prev === groupLabel ? null : groupLabel));
  }

  async function handleInvite(playerId: string) {
    setSendingInvite(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: playerId,
          message: inviteMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }

      toast.success("Invite sent!");
      setInviteTarget(null);
      setInviteMessage("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  }

  const selectedLabels = selectedPositions.map((p) => p);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Players</h1>
          <p className="text-text-secondary">Find and invite players to your club</p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            showFilter || selectedPositions.length > 0
              ? "bg-pitch-900/30 text-pitch-400"
              : "text-text-secondary hover:bg-surface-2"
          )}
        >
          <Filter size={16} />
          Filters
          {selectedPositions.length > 0 && (
            <Badge variant="success" className="ml-1">{selectedPositions.length}</Badge>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <Input
          placeholder="Search by name or club..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        {/* Position Filter Dropdown */}
        {showFilter && (
          <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Position</span>
              {selectedPositions.length > 0 && (
                <button
                  onClick={() => setSelectedPositions([])}
                  className="flex items-center gap-1 text-xs text-pitch-400 hover:text-pitch-300"
                >
                  <X size={12} />
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-1">
              {POSITION_GROUPS.map((group) => {
                const isExpanded = expandedGroup === group.label;
                const groupSelected = group.positions.filter((p) =>
                  selectedPositions.includes(p)
                );

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-2",
                        groupSelected.length > 0 && "text-pitch-400"
                      )}
                    >
                      <span className="font-medium">{group.label}</span>
                      <div className="flex items-center gap-2">
                        {groupSelected.length > 0 && (
                          <span className="text-xs text-pitch-400">
                            {groupSelected.length} selected
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-text-muted transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="ml-3 flex flex-wrap gap-2 pb-2">
                        {group.positions.map((pos) => {
                          const isSelected = selectedPositions.includes(pos);
                          return (
                            <button
                              key={pos}
                              onClick={() => togglePosition(pos)}
                              className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                                isSelected
                                  ? "bg-pitch-600 text-white"
                                  : "bg-surface-2 text-text-secondary hover:bg-surface-3"
                              )}
                            >
                              {pos}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Club filter */}
            <div className="mt-3 border-t border-border pt-3">
              <label className="mb-2 block text-sm font-medium text-text-secondary">Club</label>
              <Select
                value={clubFilter}
                onChange={setClubFilter}
                options={[
                  { value: "all", label: "All Clubs" },
                  ...clubs.map((c: any) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {/* Active filters */}
            {selectedPositions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPositions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePosition(pos)}
                    className="flex items-center gap-1 rounded-full bg-pitch-900/30 px-2.5 py-1 text-xs text-pitch-400 hover:bg-pitch-900/50"
                  >
                    {pos}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loadingPlayers ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={40} className="mb-3 text-text-muted" />
              <p className="text-text-secondary">No players found</p>
              <p className="text-sm text-text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            players.map((player: any) => (
              <div
                key={player.user_id}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-border-light hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <DiscordAvatar
                    discordId={player.discord_id}
                    avatarHash={player.avatar}
                    size={44}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/profile/${player.user_id}`}
                        className="font-medium hover:text-pitch-400 transition-colors"
                      >
                        {player.global_name || player.username}
                      </a>
                      <span className="text-sm text-text-muted">@{player.username}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: player.club_color || "#334155" }}
                      >
                        {player.club_short_name || "?"}
                      </div>
                      <span className="text-sm text-text-secondary">{player.club_name}</span>
                      <Badge>{player.position}</Badge>
                      <Badge variant={player.role === "captain" ? "warning" : "default"}>
                        {player.role}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>{player.apps} apps</span>
                      <span>{player.goals} goals</span>
                      <span>{player.assists} assists</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setInviteTarget(player)}
                >
                  <UserPlus size={14} />
                  Invite
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog
        open={!!inviteTarget}
        onClose={() => {
          setInviteTarget(null);
          setInviteMessage("");
        }}
        title={`Invite ${inviteTarget?.global_name || inviteTarget?.username || ""}`}
      >
        <p className="mb-4 text-sm text-text-secondary">
          Send an invite to join your club
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Message (optional)
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Hey, we'd love to have you on our team!"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500/50"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setInviteTarget(null);
                setInviteMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleInvite(inviteTarget.user_id)}
              disabled={sendingInvite}
            >
              {sendingInvite ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
