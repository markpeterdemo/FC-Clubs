"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PositionSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Goal, Plus, Search, Users, Building2, ArrowLeft } from "lucide-react";

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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-pitch-600">
                <Goal size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">Welcome to Matchday!</h1>
              <p className="mt-1 text-text-secondary">
                You're not part of a club yet. Let's get you started.
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setStep("create")}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-pitch-600/50 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pitch-900/30 group-hover:bg-pitch-900/50 transition-colors">
                  <Building2 size={24} className="text-pitch-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Create a Club</h3>
                  <p className="text-sm text-text-secondary">Become a captain and build your team</p>
                </div>
              </button>

              <button
                onClick={() => setStep("join")}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-pitch-600/50 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900/30 group-hover:bg-blue-900/50 transition-colors">
                  <Search size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Join a Club</h3>
                  <p className="text-sm text-text-secondary">Find a team and request to join</p>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "create" && (
          <>
            <button
              onClick={() => setStep("choice")}
              className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h2 className="mb-6 text-xl font-bold">Create Your Club</h2>

            <div className="space-y-5 rounded-xl border border-border bg-card p-6">
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
                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent"
                  />
                  <span className="text-sm text-text-muted">{clubColor}</span>
                </div>
              </div>

              <PositionSelect
                value={position}
                onChange={setPosition}
              />

              <Button
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
              className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h2 className="mb-6 text-xl font-bold">Join a Club</h2>

            <div className="mb-6 space-y-5 rounded-xl border border-border bg-card p-6">
              <PositionSelect
                label="Your Position"
                value={position}
                onChange={setPosition}
              />
            </div>

            <Input
              placeholder="Search clubs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {searching && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
              </div>
            )}

            <div className="space-y-3">
              {searchResults.map((club: any) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-border-light"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
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
                    onClick={() => handleJoinClub(club.id)}
                    disabled={!position}
                  >
                    {club.visibility === "public" ? "Join" : "Request"}
                  </Button>
                </div>
              ))}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="py-8 text-center text-text-muted">
                  No clubs found matching "{searchQuery}"
                </p>
              )}

              {searchQuery.length < 2 && (
                <p className="py-8 text-center text-text-muted">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
