"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Trophy, Users, Swords, BarChart3, ArrowRight, Shield, Zap, Medal } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Trophy, title: "League Standings", desc: "Real-time table with form guides, streaks, and position battles." },
  { icon: Users, title: "Player Cards", desc: "FIFA-style player cards with stats, ratings, and rarity tiers." },
  { icon: Swords, title: "Match Center", desc: "Live pitch view, event timeline, and head-to-head stats." },
  { icon: BarChart3, title: "Deep Analytics", desc: "Leaderboards, power rankings, and team of the week." },
  { icon: Shield, title: "Transfer Market", desc: "Player transfers with windows, bids, and approvals." },
  { icon: Zap, title: "Achievements", desc: "Unlock badges, earn awards, climb the hall of fame." },
]

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-glow-green pointer-events-none" />
          <div className="absolute inset-0 bg-grid pointer-events-none" />

          <StaggerContainer className="relative max-w-4xl mx-auto text-center px-4">
            <StaggerItem>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium mb-8">
                <Medal size={14} />
                Spring 2025 Season Active
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Welcome to
                </span>
                <br />
                <span className="text-gradient-green">Matchday FC</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
                The ultimate football league management platform. Build your club, dominate the standings, 
                and earn your place in the hall of fame.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" variant="glow">
                    Get Started
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/standings">
                  <Button size="lg" variant="secondary">
                    View Standings
                  </Button>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-text-muted">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-green" /> 10 Clubs</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-blue" /> 25 Players</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-gold" /> 20 Matches</span>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-white/5">
          <StaggerContainer className="max-w-6xl mx-auto px-4" staggerDelay={0.05}>
            <StaggerItem>
              <h2 className="text-3xl font-black text-center mb-4">
                Everything You Need
              </h2>
              <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">
                A complete platform for competitive football leagues.
              </p>
            </StaggerItem>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <StaggerItem key={i}>
                    <Card variant="glass" hover glow className="group">
                      <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon size={20} className="text-accent-green" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                      <p className="text-sm text-text-muted">{f.desc}</p>
                    </Card>
                  </StaggerItem>
                )
              })}
            </div>
          </StaggerContainer>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-2xl mx-auto text-center px-4">
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              <div className="absolute inset-0 bg-glow-green pointer-events-none" />
              <h2 className="text-2xl font-black relative">Ready to Play?</h2>
              <p className="text-text-secondary mt-2 mb-6 relative">
                Join the league, create your club, and compete for glory.
              </p>
              <Link href="/login">
                <Button variant="glow" size="lg">
                  Sign In with Discord <ArrowRight size={18} />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-xs text-text-muted">
          Matchday FC &mdash; Football League Management Platform
        </footer>
      </div>
    </PageTransition>
  )
}
