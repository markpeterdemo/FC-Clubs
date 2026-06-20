"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Goal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

const errorMessages: Record<string, string> = {
  no_code: "Authorization failed. Please try again.",
  token_failed: "Could not authenticate with Discord. Please try again.",
  user_fetch_failed: "Could not fetch your Discord profile. Please try again.",
  unknown: "Something went wrong. Please try again.",
};

export function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error && errorMessages[error]) {
      toast.error(errorMessages[error]);
    }
  }, [error]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <Skeleton className="mx-auto h-14 w-14 rounded-xl" />
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl border border-border glass p-8 text-center shadow-elevated">
          <div className="absolute inset-0 bg-gradient-to-b from-pitch-500/[0.03] to-transparent pointer-events-none" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-700 shadow-lg shadow-pitch-500/25">
              <Goal size={28} className="text-white" />
            </div>

            <h1 className="mb-2 text-2xl font-bold">
              Sign in to <span className="text-gradient">Matchday</span>
            </h1>
            <p className="mb-8 text-sm text-text-secondary">
              Connect your Discord account to get started
            </p>

            <a href="/api/auth/discord" className="block">
              <Button variant="discord" size="lg" className="w-full">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Sign in with Discord
              </Button>
            </a>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
              <Shield size={12} />
              <span>Protected by Discord authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
