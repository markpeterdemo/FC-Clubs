"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DiscordAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Swords,
  Users,
  ChevronDown,
  GripVertical,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { FORMATIONS, FORMATION_SLOTS, type Formation, type Position } from "@/lib/types";

// Pitch slot positions for visual layout (percentage-based)
const SLOT_POSITIONS: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 92 },
  LB: { x: 10, y: 68 },
  CB: { x: 38, y: 72 },
  CB2: { x: 62, y: 72 },
  RB: { x: 90, y: 68 },
  LWB: { x: 10, y: 68 },
  RWB: { x: 90, y: 68 },
  CDM: { x: 50, y: 55 },
  LM: { x: 10, y: 45 },
  CM: { x: 38, y: 50 },
  CM2: { x: 62, y: 50 },
  RM: { x: 90, y: 45 },
  CAM: { x: 50, y: 35 },
  LW: { x: 15, y: 25 },
  RW: { x: 85, y: 25 },
  ST: { x: 50, y: 12 },
  ST2: { x: 35, y: 12 },
};

function getSlotKey(formation: Formation, slotIndex: number): string {
  const slots = FORMATION_SLOTS[formation];
  const position = slots[slotIndex];

  if (position === "CB") {
    // Determine if first or second CB
    const cbCount = slots.filter((p) => p === "CB").length;
    if (cbCount > 1) {
      const cbIndex = slots.filter((p, i) => p === "CB" && i <= slotIndex).length;
      return cbIndex === 1 ? "CB" : "CB2";
    }
  }
  if (position === "CM") {
    const cmCount = slots.filter((p) => p === "CM").length;
    if (cmCount > 1) {
      const cmIndex = slots.filter((p, i) => p === "CM" && i <= slotIndex).length;
      return cmIndex === 1 ? "CM" : "CM2";
    }
  }
  if (position === "ST") {
    const stCount = slots.filter((p) => p === "ST").length;
    if (stCount > 1) {
      const stIndex = slots.filter((p, i) => p === "ST" && i <= slotIndex).length;
      return stIndex === 1 ? "ST" : "ST2";
    }
  }

  return position;
}

function DraggablePlayer({
  player,
  isActive,
}: {
  player: any;
  isActive?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.user_id,
    data: player,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-lg bg-surface-2 p-2 text-sm transition-colors hover:bg-surface-3 active:cursor-grabbing",
        isDragging && "opacity-0",
        isActive && "ring-2 ring-pitch-500"
      )}
    >
      <GripVertical size={14} className="text-text-muted shrink-0" />
      <DiscordAvatar
        discordId={player.discord_id}
        avatarHash={player.avatar}
        size={24}
      />
      <span className="truncate font-medium text-xs">
        {player.global_name || player.username}
      </span>
      <Badge className="text-[9px] px-1 py-0 ml-auto">{player.position}</Badge>
    </div>
  );
}

function DroppableSlot({
  id,
  position,
  assignedPlayer,
  isOver,
}: {
  id: string;
  position: string;
  assignedPlayer: any;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver: isOverDrop } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center rounded-lg border-2 border-dashed transition-all",
        assignedPlayer
          ? "border-pitch-600 bg-pitch-900/30"
          : isOver
          ? "border-pitch-400 bg-pitch-900/20"
          : "border-border bg-surface-2/50 hover:border-border-light",
        isOver && "scale-110"
      )}
      style={{
        width: 64,
        height: 56,
      }}
    >
      {assignedPlayer ? (
        <div className="text-center">
          <DiscordAvatar
            discordId={assignedPlayer.discord_id}
            avatarHash={assignedPlayer.avatar}
            size={24}
          />
          <p className="text-[9px] font-medium mt-0.5 leading-tight truncate max-w-[56px]">
            {assignedPlayer.global_name || assignedPlayer.username}
          </p>
        </div>
      ) : (
        <span className="text-[10px] text-text-muted">{position}</span>
      )}
    </div>
  );
}

export default function NewMatchPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formation, setFormation] = useState<Formation>("4-3-3");
  const [members, setMembers] = useState<any[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [pitchSlots, setPitchSlots] = useState<(any | null)[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [activePlayer, setActivePlayer] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/clubs/${id}/members`);
        if (res.ok) {
          const data = await res.json();
          const players = data.members.filter(
            (m: any) => m.role !== "captain" || m.user_id === user?.id
          );
          setMembers(players);
          setAvailablePlayers(players);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchMembers();
  }, [id, user]);

  // Initialize pitch slots when formation changes
  useEffect(() => {
    const slots = FORMATION_SLOTS[formation];
    setPitchSlots(new Array(slots.length).fill(null));
  }, [formation]);

  function handleDragStart(event: DragStartEvent) {
    const player = event.active.data.current;
    setActivePlayer(player);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActivePlayer(null);
    const { active, over } = event;
    if (!over) return;

    const player = active.data.current;
    if (!player) return;

    const dropId = over.id as string;

    // Dropped on a pitch slot
    if (dropId.startsWith("slot-")) {
      const slotIndex = parseInt(dropId.split("-")[1], 10);

      setPitchSlots((prev) => {
        const next = [...prev];

        // If player was already in another slot, remove them
        const existingIndex = next.findIndex(
          (p) => p?.user_id === player.user_id
        );
        if (existingIndex !== -1) next[existingIndex] = null;

        // If slot is occupied, swap
        const slotPlayer = next[slotIndex];
        if (slotPlayer) {
          setAvailablePlayers((avail) => [...avail, slotPlayer]);
        }

        next[slotIndex] = player;
        return next;
      });

      setAvailablePlayers((prev) =>
        prev.filter((p) => p.user_id !== player.user_id)
      );
    }

    // Dropped on subs area
    if (dropId === "subs-area") {
      setPitchSlots((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex(
          (p) => p?.user_id === player.user_id
        );
        if (existingIndex !== -1) next[existingIndex] = null;
        return next;
      });

      setSubs((prev) => {
        if (prev.find((p) => p.user_id === player.user_id)) return prev;
        return [...prev, player];
      });

      setAvailablePlayers((prev) =>
        prev.filter((p) => p.user_id !== player.user_id)
      );
    }

    // Dropped back to available
    if (dropId === "available-area") {
      setPitchSlots((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex(
          (p) => p?.user_id === player.user_id
        );
        if (existingIndex !== -1) next[existingIndex] = null;
        return next;
      });

      setSubs((prev) => prev.filter((p) => p.user_id !== player.user_id));

      if (!availablePlayers.find((p) => p.user_id === player.user_id)) {
        setAvailablePlayers((prev) => [...prev, player]);
      }
    }
  }

  async function handleSaveLineup() {
    setSaving(true);
    try {
      const starters = pitchSlots
        .map((player, index) => ({
          player_id: player?.user_id,
          position: FORMATION_SLOTS[formation][index],
          is_substitute: false,
        }))
        .filter((s) => s.player_id);

      const subsData = subs.map((player: any) => ({
        player_id: player.user_id,
        position: player.position,
        is_substitute: true,
      }));

      // For now save a match with minimal data
      const matchRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: id,
          formation,
          starters,
          subs: subsData,
        }),
      });

      if (!matchRes.ok) throw new Error("Failed to save lineup");

      toast.success("Lineup saved!");
      router.push(`/clubs/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function removeFromSlot(slotIndex: number) {
    const player = pitchSlots[slotIndex];
    if (!player) return;

    setPitchSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });

    if (!availablePlayers.find((p) => p.user_id === player.user_id)) {
      setAvailablePlayers((prev) => [...prev, player]);
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      </div>
    );
  }

  const slotPositions = FORMATION_SLOTS[formation];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/clubs/${id}`}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Set Lineup</h1>
            <p className="text-text-secondary">Drag players onto the pitch</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={formation}
            onChange={(v) => setFormation(v as Formation)}
            options={FORMATIONS.map((f) => ({ value: f, label: f }))}
            className="w-28"
          />
          <Button onClick={handleSaveLineup} disabled={saving}>
            {saving ? "Saving..." : "Save Lineup"}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Pitch */}
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            {/* Pitch SVG background */}
            <svg
              viewBox="0 0 500 700"
              className="w-full"
              style={{ background: "linear-gradient(180deg, #166534 0%, #15803d 100%)" }}
            >
              {/* Field outline */}
              <rect x="20" y="20" width="460" height="660" rx="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              {/* Center line */}
              <line x1="20" y1="350" x2="480" y2="350" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              {/* Center circle */}
              <circle cx="250" cy="350" r="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              {/* Penalty areas */}
              <rect x="100" y="20" width="300" height="130" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <rect x="100" y="550" width="300" height="130" rx="5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              {/* Goal areas */}
              <rect x="160" y="20" width="180" height="50" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <rect x="160" y="630" width="180" height="50" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            </svg>

            {/* Player slots overlay */}
            <div className="absolute inset-0">
              {slotPositions.map((pos, i) => {
                const slotKey = getSlotKey(formation, i);
                const position = SLOT_POSITIONS[slotKey] || { x: 50, y: 50 };
                const assignedPlayer = pitchSlots[i];

                return (
                  <div
                    key={`slot-${i}`}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <DroppableSlot
                      id={`slot-${i}`}
                      position={pos}
                      assignedPlayer={assignedPlayer}
                    />
                    {assignedPlayer && (
                      <button
                        onClick={() => removeFromSlot(i)}
                        className="mt-0.5 text-[8px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subs area on pitch */}
            <div className="absolute bottom-2 left-2 right-2">
              <DroppableSlot
                id="subs-area"
                position="SUBS"
                assignedPlayer={null}
              />
            </div>
          </div>

          {/* Available Players */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Available</h3>
                <Users size={14} className="text-text-muted" />
              </div>

              <div id="available-area" className="space-y-2 min-h-[200px]">
                {/* The available container is implicitly a drop zone too */}
                {availablePlayers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-text-muted">
                    All players on pitch
                  </p>
                ) : (
                  availablePlayers.map((player: any) => (
                    <DraggablePlayer
                      key={player.user_id}
                      player={player}
                      isActive={activePlayer?.user_id === player.user_id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Subs */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold">
                Subs ({subs.length})
              </h3>
              <div className="space-y-2">
                {subs.length === 0 ? (
                  <p className="py-4 text-center text-xs text-text-muted">
                    Drag players here for subs
                  </p>
                ) : (
                  subs.map((player: any) => (
                    <div
                      key={player.user_id}
                      className="flex items-center gap-2 rounded-lg bg-surface-2 p-2"
                    >
                      <DiscordAvatar
                        discordId={player.discord_id}
                        avatarHash={player.avatar}
                        size={24}
                      />
                      <span className="text-xs font-medium truncate">
                        {player.global_name || player.username}
                      </span>
                      <Badge className="text-[9px] px-1 py-0 ml-auto">
                        {player.position}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activePlayer && (
            <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 shadow-xl border border-pitch-500">
              <DiscordAvatar
                discordId={activePlayer.discord_id}
                avatarHash={activePlayer.avatar}
                size={24}
              />
              <span className="text-sm font-medium">
                {activePlayer.global_name || activePlayer.username}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
