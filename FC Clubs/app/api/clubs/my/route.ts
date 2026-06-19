import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberResult = await query(
    "SELECT * FROM club_members WHERE user_id = $1 LIMIT 1",
    [session.userId]
  );

  if (memberResult.rows.length === 0) {
    return NextResponse.json({ club: null, stats: null });
  }

  const member = memberResult.rows[0];

  const clubResult = await query("SELECT * FROM clubs WHERE id = $1", [member.club_id]);
  const club = clubResult.rows[0];

  const statsResult = await query(
    "SELECT * FROM club_stats WHERE club_id = $1 ORDER BY season DESC LIMIT 1",
    [club.id]
  );
  const stats = statsResult.rows[0];

  let upcomingMatch = null;
  const matchResult = await query(
    `SELECT m.*, c.short_name as away_short
     FROM matches m
     LEFT JOIN clubs c ON c.id = m.away_club_id
     WHERE (m.home_club_id = $1 OR m.away_club_id = $1)
       AND m.status = 'scheduled'
     ORDER BY m.match_date ASC
     LIMIT 1`,
    [club.id]
  );
  if (matchResult.rows.length > 0) {
    upcomingMatch = matchResult.rows[0];
  }

  return NextResponse.json({
    club: { ...club, member },
    stats: stats
      ? {
          played: stats.played,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
          goals_for: stats.goals_for,
          goals_against: stats.goals_against,
          points: stats.wins * 3 + stats.draws,
          goal_diff: stats.goals_for - stats.goals_against,
        }
      : null,
    upcomingMatch,
  });
}
