import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matchday API",
  description: "Matchday Football League API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
