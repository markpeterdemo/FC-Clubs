import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Matchday FC",
  description: "Football League Management Platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="scrollbar-thin">
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
