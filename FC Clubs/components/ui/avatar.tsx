"use client"

import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  ring?: boolean
}

export function Avatar({ src, name, size = "md", className, ring = false }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center font-bold text-white shrink-0",
        "bg-gradient-to-br from-accent-green/30 to-accent-blue/30",
        ring && "ring-2 ring-accent-green/30 ring-offset-2 ring-offset-bg-primary",
        size === "sm" && "w-7 h-7 text-xs",
        size === "md" && "w-9 h-9 text-sm",
        size === "lg" && "w-12 h-12 text-base",
        size === "xl" && "w-16 h-16 text-lg",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

interface AvatarGroupProps {
  users: { name: string; avatar?: string | null }[]
  max?: number
  size?: "sm" | "md"
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} src={u.avatar} size={size} className="ring-2 ring-bg-primary" />
      ))}
      {remaining > 0 && (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-text-muted ring-2 ring-bg-primary">
          +{remaining}
        </div>
      )}
    </div>
  )
}
