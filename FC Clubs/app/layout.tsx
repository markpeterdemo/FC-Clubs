import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Matchday — FC League Hub",
  description: "The ultimate platform for managing your football club league. Standings, lineups, stats, and more.",
  openGraph: {
    title: "Matchday — FC League Hub",
    description: "The ultimate platform for managing your football club league.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface text-text-primary antialiased transition-colors duration-300">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <Nav />
              <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
                {children}
              </main>
              <Toaster position="bottom-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
