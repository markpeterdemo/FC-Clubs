export interface ClubStats {
  club_id?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}

export interface MatchForm {
  won: boolean;
  drew: boolean;
  is_home: boolean;
}

export interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  predictedScore: { home: number; away: number };
}

export interface Insight {
  type: "positive" | "negative" | "neutral" | "record";
  message: string;
  icon: string;
}

export function getFormInsights(
  clubName: string,
  stats: ClubStats,
  form: MatchForm[],
  allClubStats: ClubStats[]
): Insight[] {
  const insights: Insight[] = [];

  if (!stats || stats.played === 0) {
    insights.push({ type: "neutral", message: `${clubName} hasn't played any matches yet this season.`, icon: "📋" });
    return insights;
  }

  // Streak detection
  const winStreak = countConsecutive(form, (r) => r.won);
  if (winStreak >= 5) {
    insights.push({ type: "record", message: `${clubName} is on fire! ${winStreak} consecutive wins! 🔥`, icon: "🔥" });
  } else if (winStreak >= 3) {
    insights.push({ type: "positive", message: `${clubName} is on a ${winStreak}-game winning streak.`, icon: "📈" });
  }

  const lossStreak = countConsecutive(form, (r) => !r.won && !r.drew);
  if (lossStreak >= 3) {
    insights.push({ type: "negative", message: `${clubName} has lost ${lossStreak} in a row. Time to turn things around.`, icon: "📉" });
  }

  // Best attack
  const mostGoals = allClubStats.every(
    (c) => c.club_id === stats.club_id || c.goals_for <= stats.goals_for
  );
  if (mostGoals && stats.played > 0) {
    insights.push({
      type: "positive",
      message: `Best attack in the league — ${stats.goals_for} goals scored.`,
      icon: "⚽",
    });
  }

  // Best defense
  const fewestConceded = allClubStats.every(
    (c) => c.club_id === stats.club_id || c.goals_against >= stats.goals_against
  );
  if (fewestConceded && stats.played > 0) {
    insights.push({
      type: "positive",
      message: `Best defense in the league — only ${stats.goals_against} conceded.`,
      icon: "🛡️",
    });
  }

  // Unbeaten at home
  const homeForm = form.filter((r) => r.is_home);
  if (homeForm.length >= 3 && homeForm.every((r) => r.won || r.drew)) {
    insights.push({ type: "positive", message: `Unbeaten at home this season. Fortress ${clubName.split(" ").pop()}!`, icon: "🏠" });
  }

  // Win rate
  const winRate = stats.wins / stats.played;
  if (winRate >= 0.7 && stats.played >= 5) {
    insights.push({ type: "positive", message: `${(winRate * 100).toFixed(0)}% win rate — dominant season.`, icon: "👑" });
  } else if (winRate <= 0.2 && stats.played >= 5) {
    insights.push({ type: "negative", message: `${(winRate * 100).toFixed(0)}% win rate — tough season.`, icon: "😤" });
  }

  return insights;
}

export function predictMatch(home: ClubStats, away: ClubStats): Prediction {
  if (home.played === 0 && away.played === 0) {
    return { homeWin: 40, draw: 20, awayWin: 40, predictedScore: { home: 1, away: 1 } };
  }

  const homeStrength = home.played > 0
    ? (home.wins / home.played) * 0.4 + (home.goals_for / home.played) * 0.3
    : 0.5;

  const awayStrength = away.played > 0
    ? (away.wins / away.played) * 0.4 + (away.goals_for / away.played) * 0.3
    : 0.5;

  const total = homeStrength + awayStrength + 0.2;

  const homeWinPct = Math.round((homeStrength / total) * 80 + 10);
  const awayWinPct = Math.round((awayStrength / total) * 80 + 10);
  const drawPct = 100 - homeWinPct - awayWinPct;

  const homeGoals = Math.round((home.goals_for / Math.max(home.played, 1)) * 0.8 + 0.5);
  const awayGoals = Math.round((away.goals_for / Math.max(away.played, 1)) * 0.6 + 0.3);

  return {
    homeWin: homeWinPct,
    draw: drawPct,
    awayWin: awayWinPct,
    predictedScore: { home: Math.max(1, homeGoals), away: Math.max(0, awayGoals) },
  };
}

export function suggestBestLineup(
  members: { user_id: string; global_name: string; position: string; goals: number; assists: number; apps: number }[],
  formationSlots: string[]
): (typeof members[0] | null)[] {
  const sorted = [...members].sort(
    (a, b) => b.goals + b.assists + b.apps * 0.2 - (a.goals + a.assists + a.apps * 0.2)
  );

  return formationSlots.map((pos) => {
    if (pos === "GK") {
      return sorted.find((p) => p.position === "GK") || null;
    }
    const defs = ["CB", "LB", "RB"];
    const mids = ["CDM", "CM", "CAM", "LAM", "RAM", "LM", "RM"];
    const fwds = ["LW", "RW", "ST"];

    let pool: typeof sorted;
    if (defs.includes(pos)) {
      pool = sorted.filter((p) => defs.includes(p.position) || p.position === pos);
    } else if (mids.includes(pos)) {
      pool = sorted.filter((p) => mids.includes(p.position) || p.position === pos);
    } else if (fwds.includes(pos)) {
      pool = sorted.filter((p) => fwds.includes(p.position) || p.position === pos);
    } else {
      pool = sorted;
    }

    const player = pool.find((p) => p.position === pos);
    if (player) return player;

    return pool[0] || null;
  });
}

function countConsecutive(form: MatchForm[], predicate: (r: MatchForm) => boolean): number {
  let count = 0;
  for (const r of form) {
    if (predicate(r)) count++;
    else break;
  }
  return count;
}
