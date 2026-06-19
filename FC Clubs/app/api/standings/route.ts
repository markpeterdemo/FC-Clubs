import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const leagueResult = await query("SELECT season FROM leagues WHERE is_active = true LIMIT 1");
    const season = leagueResult.rows.length > 0 ? leagueResult.rows[0].season : 'Spring 2025';

    const result = await query(`
      SELECT
        c.id, c.name, c.short_name, c.primary_color,
        COALESCE(cs.played, 0)::int as played,
        COALESCE(cs.wins, 0)::int as wins,
        COALESCE(cs.draws, 0)::int as draws,
        COALESCE(cs.losses, 0)::int as losses,
        COALESCE(cs.goals_for, 0)::int as goals_for,
        COALESCE(cs.goals_against, 0)::int as goals_against,
        (COALESCE(cs.goals_for, 0) - COALESCE(cs.goals_against, 0))::int as goal_diff,
        (COALESCE(cs.wins, 0) * 3 + COALESCE(cs.draws, 0))::int as points,
        COUNT(cm.id)::int as member_count
      FROM clubs c
      LEFT JOIN club_stats cs ON cs.club_id = c.id AND cs.season = $1
      LEFT JOIN club_members cm ON cm.club_id = c.id
      GROUP BY c.id, cs.played, cs.wins, cs.draws, cs.losses, cs.goals_for, cs.goals_against
      ORDER BY points DESC, goal_diff DESC, cs.goals_for DESC
    `, [season]);

    return NextResponse.json({ standings: result.rows, season });
  } catch (error) {
    console.error("Standings fetch error:", error);
    return NextResponse.json({ standings: [] });
  }
}
