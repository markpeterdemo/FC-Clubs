import Link from "next/link";
import { Goal, Users, Trophy, Swords, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto max-w-3xl text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pitch-600 shadow-lg shadow-pitch-600/30">
          <Goal size={32} className="text-white" />
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-pitch-400 to-pitch-600 bg-clip-text text-transparent">
            Matchday
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg text-text-secondary">
          The ultimate platform for managing your football club league.
          Track standings, build lineups, view stats, and connect with your team.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-discord px-8 py-4 text-base font-semibold text-white shadow-lg shadow-discord/30 transition-all hover:bg-discord-hover hover:shadow-xl hover:shadow-discord/40"
        >
          Sign in with Discord
          <ArrowRight size={18} />
        </Link>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Trophy, title: "League Standings", desc: "Live table with points, GD, and form" },
            { icon: Users, title: "Player Directory", desc: "Find players by position and invite them" },
            { icon: Swords, title: "Match Lineups", desc: "Drag-and-drop formation builder" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-pitch-600/50 hover:shadow-lg hover:shadow-pitch-600/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pitch-900/30">
                <feature.icon size={20} className="text-pitch-400" />
              </div>
              <h3 className="mb-1 font-semibold">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
