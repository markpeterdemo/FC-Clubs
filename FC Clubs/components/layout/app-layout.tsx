"use client"

import { Nav } from "@/components/layout/nav"
import type { ReactNode } from "react"

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}
