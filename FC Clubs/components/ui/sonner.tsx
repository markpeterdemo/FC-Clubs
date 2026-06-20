"use client"

import { Toaster as SonnerToaster } from "sonner"
import { cn } from "@/lib/utils"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#141428",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
          borderRadius: "12px",
        },
      }}
    />
  )
}
