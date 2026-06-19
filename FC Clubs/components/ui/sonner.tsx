"use client";

import { Toaster as SonnerToaster } from "sonner";

interface ToasterProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "top-center" | "bottom-center";
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position={position}
      toastOptions={{
        style: {
          background: "#1e293b",
          border: "1px solid #334155",
          color: "#f1f5f9",
        },
      }}
    />
  );
}
