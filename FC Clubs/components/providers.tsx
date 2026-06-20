"use client"

import { type ReactNode } from "react"
import { AuthProvider } from "@/providers/auth-context"
import { QueryProvider } from "@/providers/query-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  )
}
