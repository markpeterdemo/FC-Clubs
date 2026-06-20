"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PositionSelect } from "@/components/ui/select";
import { toast } from "sonner";
import { Goal, Search, Building2, ArrowLeft } from "lucide-react";

export default function JoinPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"choice" | "create" | "join">("choice");
  const [position, setPosition] = useState("");
  const [clubName, setClubName] = useState("");
  const [clubShort, setClubShort] = useState("");
  const [clubColor, setClubColor] = useState("#22c55e");
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/clubs?q=${encodeURIComponent(searchQuery)}&visibility=public`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.clubs);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) return null;

  async function handleCreateClub() {
    if (!clubName || !position) {
      toast.error("Club name and position are required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clubName,
          short_name: clubShort || clubName.slice(0, 3).toUpperCase(),
          primary_color: clubColor,
          position,
          role: "captain",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create club");
      }

      toast.success("Club created! Welcome, captain.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinClub(clubId: string) {
    if (!position) {
      toast.error("Select a position first");
      return;
    }

    try {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: clubId, position }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }

      const data = await res.json();
      if (data.status === "pending") {
        toast.success("Join request sent! Wait for captain approval.");
      } else {
        toast.success("Welcome to the club!");
      }
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="animate-fade-in">
        {step === "choice" && (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-700 shadow-lg shadow-pitch-500/25">
                <Goal size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">
                Welcome to <span className="text-gradient">Matchday</span>
              </h1>
              <p className="mt-1 text-text-secondary">
                You're not part of a club yet. Let's get you started.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setStep("create")}
                className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-border glass p-5 text-left transition-all duration-300 hover:border-pitch-500/30 hover:shadow-glow hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pitch-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pitch-500/20 to-pitch-700/20 group-hover:from-pitch-500/30 group-hover:to-pitch-700/30 transition-all duration-300 ring-1 ring-pitch-500/10 group-hover:ring-pitch-500/20">
                  <Building2 size={24} className="text-pitch-400" />
                </div>
                <div className="relative">
                  <h3 className="font-semibold">Create a Club</h3>
                  <p className="text-sm text-text-secondary">Become a captain and build your team</p>
                </div>
              </button>

              <button
                onClick={() => setStep("join")}
                className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-border glass p-5 text-left transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 group-hover:from-blue-500/30 group-hover:to-blue-700/30 transition-all duration-300 ring-1 ring-blue-500/10 group-hover:ring-blue-500/20">
                  <Search size={24} className="text-blue-400" />
                </div>
                <div className="relative">
                  <h3 className="font-semibold">Find a Club</h3>
                  <p className="text-sm text-text-secondary">Search for a team and request to join</p>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "create" && (
          <>
            <button
              onClick={() => setStep("choice")}
              className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-all duration-200 group"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back
            </button>

            <h2 className="mb-6 text-xl font-bold">Create Your Club</h2>

            <div className="space-y-5 rounded-2xl border border-border glass p-6 shadow-elevated">
              <Input
                label="Club Name"
                placeholder="e.g. FC Barcelona"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />

              <Input
                label="Short Name"
                placeholder="e.g. FCB"
                value={clubShort}
                onChange={(e) => setClubShort(e.target.value)}
                className="max-w-[120px] uppercase"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Club Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={clubColor}
                    onChange={(e) => setClubColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-xl border border-border bg-transparent"
                  />
                  <span className="text-sm text-text-muted font-mono">{clubColor}</span>
                </div>
              </div>

              <PositionSelect
                value={position}
                onChange={setPosition}
                label="Your Position"
              />

              <Button
                variant="premium"
                onClick={handleCreateClub}
                disabled={creating || !clubName || !position}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Club"}
              </Button>
            </div>
          </>
        )}

        {step === "join" && (
          <>
            <button
              onClick={() => setStep("choice")}
              className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-all duration-200 group"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back
            </button>

            <h2 className="mb-6 text-xl font-bold">Join a Club</h2>

            <div className="mb-6 space-y-5 rounded-2xl border border-border glass p-6 shadow-elevated">
              <PositionSelect
                label="Your Position"
                value={position}
                onChange={setPosition}
              />
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search clubs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
              </div>
            )}

            <div className="space-y-3">
              {searchResults.map((club: any) => (
                <div
                  key={club.id}
                  className="group flex items-center justify-between rounded-2xl border border-border glass p-4 transition-all duration-300 hover:border-border-light hover:shadow-elevated"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: club.primary_color }}
                    >
                      {club.short_name || club.name.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-xs text-text-muted">
                        {club.visibility === "public" ? "Open join" : "Private"} ·{" "}
                        {club.member_count || "?"} members
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={club.visibility === "public" ? "primary" : "secondary"}
                    onClick={() => handleJoinClub(club.id)}
                    disabled={!position}
                  >
                    {club.visibility === "public" ? "Join" : "Request"}
                  </Button>
                </div>
              ))}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-text-muted">
                    No clubs found matching "<span className="text-text-secondary font-medium">{searchQuery}</span>"
                  </p>
                </div>
              )}

              {searchQuery.length < 2 && (
                <div className="py-12 text-center">
                  <p className="text-text-muted">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
