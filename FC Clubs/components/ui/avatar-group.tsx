"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: number;
  className?: string;
}

export function AvatarGroup({ children, max = 4, size = 32, className }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children];
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((child, i) => (
        <div
          key={i}
          className="ring-2 ring-surface rounded-full"
          style={{ marginLeft: i > 0 ? -size / 4 : 0, zIndex: visible.length - i }}
        >
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="flex items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-text-secondary ring-2 ring-surface"
          style={{ width: size, height: size, marginLeft: -size / 4, zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}