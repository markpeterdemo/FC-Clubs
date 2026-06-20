"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/lib/theme-provider";

interface ToasterProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "top-center" | "bottom-center";
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      position={position}
      toastOptions={{
        style: {
          background: theme === "dark" ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.85)",
          border: theme === "dark" ? "1px solid rgba(51, 65, 85, 0.6)" : "1px solid rgba(226, 232, 240, 0.8)",
          color: theme === "dark" ? "#f1f5f9" : "#0f172a",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        },
      }}
    />
  );
}
