import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric",
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit",
  }).format(new Date(date))
}

export function timeAgo(date: string | Date) {
  const now = new Date()
  const d = new Date(date)
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDateShort(d)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function rarityFromRating(rating: number): "common" | "rare" | "epic" | "legendary" {
  if (rating >= 85) return "legendary"
  if (rating >= 75) return "epic"
  if (rating >= 65) return "rare"
  return "common"
}

export function overallRating(goals: number, assists: number, apps: number): number {
  if (apps === 0) return 50
  const goalRate = (goals / Math.max(apps, 1)) * 15
  const assistRate = (assists / Math.max(apps, 1)) * 10
  const exp = Math.min(apps * 2, 20)
  return Math.min(Math.round(50 + goalRate + assistRate + exp), 99)
}