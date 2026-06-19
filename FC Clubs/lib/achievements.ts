export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { key: "first_goal", name: "First Goal", description: "Score your first career goal", icon: "⚡", emoji: "⚡" },
  { key: "hat_trick", name: "Hat Trick Hero", description: "Score 3 or more goals in a single match", icon: "🎩", emoji: "🎩" },
  { key: "brace", name: "Brace Yourself", description: "Score 2 goals in a single match", icon: "2️⃣", emoji: "2️⃣" },
  { key: "clean_sweep", name: "Clean Sweep", description: "Keep 5 clean sheets", icon: "🧹", emoji: "🧹" },
  { key: "iron_man", name: "Iron Man", description: "Make 20 appearances in a season", icon: "💪", emoji: "💪" },
  { key: "playmaker", name: "Playmaker", description: "Get 10 assists in a season", icon: "🎯", emoji: "🎯" },
  { key: "golden_boot", name: "Golden Boot", description: "Finish as top scorer in a season", icon: "👟", emoji: "👟" },
  { key: "captain", name: "True Captain", description: "Win the league as captain", icon: "🛡️", emoji: "🛡️" },
  { key: "comeback_kid", name: "Comeback Kid", description: "Win after being 2+ goals down", icon: "🔄", emoji: "🔄" },
  { key: "century", name: "Century", description: "Make 100 appearances total", icon: "💯", emoji: "💯" },
  { key: "perfect_season", name: "Perfect Streak", description: "Win 10 consecutive matches", icon: "🔥", emoji: "🔥" },
  { key: "first_appearance", name: "Debut", description: "Make your first appearance", icon: "🌟", emoji: "🌟" },
  { key: "five_goals", name: "Five-Goal Thriller", description: "Score 5+ goals in one match", icon: "5️⃣", emoji: "5️⃣" },
  { key: "assist_king", name: "Assist King", description: "Get 3 assists in a single match", icon: "👑", emoji: "👑" },
  { key: "penalty_save", name: "Penalty Hero", description: "Save a penalty", icon: "🧤", emoji: "🧤" },
];

export function getBadge(key: string): BadgeDef | undefined {
  return BADGES.find((b) => b.key === key);
}

export const AWARDS = [
  { key: "golden_boot", name: "Golden Boot", description: "Most goals in the season", icon: "👟" },
  { key: "playmaker", name: "Playmaker", description: "Most assists in the season", icon: "🎯" },
  { key: "golden_glove", name: "Golden Glove", description: "Most clean sheets", icon: "🧤" },
  { key: "iron_man", name: "Iron Man", description: "Most appearances", icon: "💪" },
  { key: "best_defender", name: "Best Defender", description: "Part of the club with fewest goals conceded", icon: "🛡️" },
  { key: "most_improved", name: "Most Improved", description: "Biggest improvement from last season", icon: "📈" },
  { key: "fair_play", name: "Fair Play", description: "Fewest cards received", icon: "🤝" },
];

export function getAward(key: string) {
  return AWARDS.find((a) => a.key === key);
}
