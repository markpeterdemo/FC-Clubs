export const POSITIONS = [
  "GK", "CB", "LB", "RB",
  "CDM", "CM", "CAM", "LAM", "RAM",
  "LM", "RM", "LW", "RW", "ST",
] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_GROUPS = [
  { label: "Goalkeepers", positions: ["GK"] as Position[] },
  { label: "Defenders", positions: ["CB", "LB", "RB"] as Position[] },
  { label: "Midfielders", positions: ["CDM", "CM", "CAM", "LAM", "RAM", "LM", "RM"] as Position[] },
  { label: "Forwards", positions: ["LW", "RW", "ST"] as Position[] },
];

export const ROLES = ["captain", "manager", "player", "sub"] as const;
export type Role = (typeof ROLES)[number];

export const CLUB_VISIBILITY = ["public", "private"] as const;
export type ClubVisibility = (typeof CLUB_VISIBILITY)[number];

export const INVITE_STATUS = ["pending", "accepted", "declined", "expired"] as const;
export type InviteStatus = (typeof INVITE_STATUS)[number];

export const FORMATIONS = [
  "4-3-3", "4-4-2", "3-5-2", "4-2-3-1",
  "5-3-2", "4-1-4-1", "3-4-3", "4-5-1",
] as const;
export type Formation = (typeof FORMATIONS)[number];

export const FORMATION_SLOTS: Record<Formation, Position[]> = {
  "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "LW", "RW", "ST"],
  "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "3-5-2": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "CM", "RM", "ST", "ST"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LW", "CAM", "RW", "ST"],
  "5-3-2": ["GK", "LB", "CB", "CB", "CB", "RB", "CM", "CM", "CM", "ST", "ST"],
  "4-1-4-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "LM", "CM", "CM", "RM", "ST"],
  "3-4-3": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"],
  "4-5-1": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CAM", "LM", "RM", "ST"],
};

export interface User {
  id: string;
  discord_id: string;
  username: string;
  email: string | null;
  avatar: string | null;
  global_name: string | null;
  banner: string | null;
  public_profile: boolean;
  position: Position | null;
  is_admin: boolean;
  banned: boolean;
  created_at: string;
}

export interface League {
  id: string;
  name: string;
  season: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  primary_color: string;
  description: string | null;
  visibility: ClubVisibility;
  max_members: number;
  created_at: string;
}

export interface ClubMember {
  id: string;
  user_id: string;
  club_id: string;
  role: Role;
  position: Position | null;
  joined_at: string;
}

export interface ClubStats {
  id: string;
  club_id: string;
  season: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}

export interface ClubWithMember extends Club {
  member: ClubMember;
  stats?: ClubStats;
}

export interface Match {
  id: string;
  home_club_id: string;
  away_club_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  status: "scheduled" | "completed";
  formation_home: Formation | null;
  formation_away: Formation | null;
  created_at: string;
}

export interface MatchLineup {
  id: string;
  match_id: string;
  club_id: string;
  player_id: string;
  position: Position;
  is_substitute: boolean;
  substitution_minute: number | null;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  club_id: string;
  player_id: string;
  type: "goal" | "assist" | "substitution_on" | "substitution_off" | "yellow_card" | "red_card";
  minute: number;
  related_player_id: string | null;
}

export interface Invite {
  id: string;
  sender_id: string;
  recipient_id: string;
  club_id: string;
  message: string | null;
  status: InviteStatus;
  created_at: string;
}

export interface JoinRequest {
  id: string;
  user_id: string;
  club_id: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  reference_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface PlayerWithUser {
  user_id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  position: Position | null;
  role: Role;
  club_id: string;
  club_name: string;
  club_short_name: string | null;
  club_color: string;
  club_logo: string | null;
  apps: number;
  goals: number;
  assists: number;
}
