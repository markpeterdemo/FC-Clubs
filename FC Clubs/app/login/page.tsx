"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { PageTransition } from "@/components/page-transition"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) router.push("/dashboard")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-96 h-64 rounded-2xl" />
      </div>
    )
  }

  if (user) return null

  const handleLogin = () => {
    window.location.href = "/api/auth/discord"
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-glow-green pointer-events-none" />
        <Card variant="glass" padding="lg" className="w-full max-w-sm relative text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl font-bold mb-1">Welcome Back</h1>
          <p className="text-sm text-text-muted mb-8">
            Sign in with Discord to continue
          </p>
          <Button
            onClick={handleLogin}
            variant="glow"
            size="lg"
            className="w-full"
          >
            Sign In with Discord
          </Button>
          <p className="mt-6 text-xs text-text-muted">
            By signing in, you agree to the league rules.
          </p>
        </Card>
      </div>
    </PageTransition>
  )
}
