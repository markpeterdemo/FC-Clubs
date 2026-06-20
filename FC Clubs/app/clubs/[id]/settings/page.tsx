"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/providers/auth-context"
import { AppLayout } from "@/components/layout/app-layout"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Save, Trash2, AlertTriangle, Shield, Users, Palette, Type, Globe } from "lucide-react"
import { toast } from "sonner"

interface Club {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
  primary_color: string
  description: string | null
  visibility: "public" | "private"
  max_members: number
  created_at: string
}

interface ClubMember {
  id: string
  user_id: string
  username: string
  global_name: string | null
  avatar: string | null
  discord_id: string
  role: "captain" | "manager" | "player" | "sub"
  position: string | null
  joined_at: string
}

export default function ClubSettingsPage() {
  const params = useParams()
  const id = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [description, setDescription] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#22c55e")
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [initialized, setInitialized] = useState(false)

  const { data: clubData, isLoading: clubLoading, error: clubError } = useQuery<{ club: Club }>({
    queryKey: ["club", id],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${id}`)
      if (!res.ok) throw new Error("Club not found")
      return res.json()
    },
  })

  const { data: membersData, isLoading: membersLoading } = useQuery<{ members: ClubMember[] }>({
    queryKey: ["club-members", id],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/${id}/members`)
      return res.json()
    },
  })

  const club = clubData?.club
  const members = membersData?.members ?? []

  useEffect(() => {
    if (club && !initialized) {
      setName(club.name)
      setShortName(club.short_name || "")
      setDescription(club.description || "")
      setPrimaryColor(club.primary_color || "#22c55e")
      setVisibility(club.visibility || "public")
      setInitialized(true)
    }
  }, [club, initialized])

  const isAuthorized = !authLoading && user && members.some(
    (m) => m.user_id === user.id && (m.role === "captain" || m.role === "manager")
  )

  const updateMutation = useMutation({
    mutationFn: async (body: Partial<Club>) => {
      const res = await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Club settings updated")
      queryClient.invalidateQueries({ queryKey: ["club", id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/clubs/${id}/members/${memberId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove member")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Member removed")
      queryClient.invalidateQueries({ queryKey: ["club-members", id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Club name is required")
      return
    }
    updateMutation.mutate({
      name: name.trim(),
      short_name: shortName.trim() || null,
      description: description.trim() || null,
      primary_color: primaryColor,
      visibility,
    })
  }

  const handleRemove = (member: ClubMember) => {
    if (member.user_id === user?.id) {
      toast.error("You cannot remove yourself")
      return
    }
    removeMutation.mutate(member.user_id)
  }

  const isLoading = authLoading || clubLoading || membersLoading

  if (isLoading) return <SettingsSkeleton />

  if (clubError || !club) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertTriangle size={48} className="text-text-muted" />
            <h2 className="text-xl font-bold">Club not found</h2>
            <p className="text-sm text-text-muted">This club doesn&apos;t exist or has been removed.</p>
          </div>
        </PageTransition>
      </AppLayout>
    )
  }

  if (!isAuthorized) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Shield size={48} className="text-accent-red" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-text-muted">
              Only the captain or manager can access club settings.
            </p>
          </div>
        </PageTransition>
      </AppLayout>
    )
  }

  const isCaptain = members.some((m) => m.user_id === user?.id && m.role === "captain")

  return (
    <AppLayout>
      <PageTransition>
        <StaggerContainer>
          <StaggerItem>
            <div className="mb-8">
              <h1 className="text-2xl font-black">Club Settings</h1>
              <p className="text-sm text-text-muted mt-1">
                Manage {club.name}&apos;s settings and members.
              </p>
            </div>
          </StaggerItem>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Settings Form */}
            <div className="lg:col-span-3 space-y-6">
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Shield size={16} className="text-accent-green" />
                      General Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        <Type size={12} className="inline mr-1" />
                        Club Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter club name"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Short Name (abbreviation)
                      </label>
                      <Input
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value.toUpperCase())}
                        placeholder="e.g. FCB"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                      <textarea
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 hover:border-white/20 resize-none min-h-[80px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your club..."
                        maxLength={500}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">
                          <Palette size={12} className="inline mr-1" />
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer"
                          />
                          <Input
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">
                          <Globe size={12} className="inline mr-1" />
                          Visibility
                        </label>
                        <Select
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                          options={[
                            { value: "public", label: "Public" },
                            { value: "private", label: "Private" },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleSave}
                        variant="primary"
                        disabled={updateMutation.isPending}
                      >
                        <Save size={16} />
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>

            {/* Members Management */}
            <div className="lg:col-span-2 space-y-6">
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Users size={16} className="text-accent-blue" />
                      Members ({members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {members.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">No members.</p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => {
                          const isSelf = member.user_id === user?.id
                          const name = member.global_name || member.username
                          return (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <Avatar
                                name={name}
                                src={member.avatar}
                                size="sm"
                                ring={member.role === "captain"}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white truncate">
                                    {name}
                                  </span>
                                  {isSelf && <span className="text-[10px] text-text-muted">(you)</span>}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <RoleBadgeSmall role={member.role} />
                                  {member.position && (
                                    <span className="text-[10px] text-text-muted">{member.position}</span>
                                  )}
                                </div>
                              </div>
                              {isCaptain && !isSelf && member.role !== "captain" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-accent-red hover:text-accent-red hover:bg-accent-red/10"
                                  onClick={() => handleRemove(member)}
                                  disabled={removeMutation.isPending}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </PageTransition>
    </AppLayout>
  )
}

function RoleBadgeSmall({ role }: { role: string }) {
  const config: Record<string, { className: string; label: string }> = {
    captain: { className: "bg-accent-gold/20 text-accent-gold", label: "C" },
    manager: { className: "bg-accent-blue/20 text-accent-blue", label: "M" },
    player: { className: "bg-accent-green/20 text-accent-green", label: "P" },
    sub: { className: "bg-white/10 text-text-muted", label: "S" },
  }
  const c = config[role] || { className: "bg-white/10 text-text-muted", label: "?" }
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", c.className)}>
      {c.label}
    </span>
  )
}

function SettingsSkeleton() {
  return (
    <AppLayout>
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 rounded-2xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
