import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stat = searchParams.get("stat") || "goals";

  const orderMap: Record<string, string> = {
    goals: "ps.goals DESC",
    assists: "ps.assists DESC",
    apps: "ps.apps DESC",
  };

  const orderBy = orderMap[stat] || "ps.goals DESC";

  let sql = `
    SELECT
      u.id as user_id, u.discord_id, u.username, u.global_name, u.avatar,
      cm.position,
      c.name as club_name, c.short_name as club_short_name, c.primary_color as club_color,
      COALESCE(ps.apps, 0)::int as apps,
      COALESCE(ps.goals, 0)::int as goals,
      COALESCE(ps.assists, 0)::int as assists
    FROM users u
    JOIN club_members cm ON cm.user_id = u.id
    JOIN clubs c ON c.id = cm.club_id
    LEFT JOIN (
      SELECT
        ml.player_id,
        COUNT(DISTINCT ml.id)::int as apps,
        COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'goal')::int as goals,
        COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'assist')::int as assists
      FROM match_lineups ml
      LEFT JOIN match_events me ON me.player_id = ml.player_id
      GROUP BY ml.player_id
    ) ps ON ps.player_id = u.id
    ORDER BY ${orderBy}
    LIMIT 20
  `;

  try {
    const result = await query(sql);
    return NextResponse.json({ leaders: result.rows });
  } catch (error) {
    console.error("Leaders fetch error:", error);
    return NextResponse.json({ leaders: [] });
  }
}
