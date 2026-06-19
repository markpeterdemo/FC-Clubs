import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const positions = searchParams.get("positions") || "";
  const clubId = searchParams.get("club_id") || "";

  let sql = `
    SELECT
      u.id as user_id, u.discord_id, u.username, u.global_name, u.avatar, u.public_profile,
      cm.position, cm.role,
      c.id as club_id, c.name as club_name, c.short_name as club_short_name,
      c.primary_color as club_color, c.logo_url as club_logo,
      COALESCE(ps.apps, 0)::int as apps,
      COALESCE(ps.goals, 0)::int as goals,
      COALESCE(ps.assists, 0)::int as assists
    FROM users u
    LEFT JOIN club_members cm ON cm.user_id = u.id
    LEFT JOIN clubs c ON c.id = cm.club_id
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
    WHERE u.public_profile = true
  `;

  const params: unknown[] = [];

  if (q) {
    sql += ` AND (u.username ILIKE $${params.length + 1} OR u.global_name ILIKE $${params.length + 1} OR c.name ILIKE $${params.length + 1})`;
    params.push(`%${q}%`);
  }

  if (positions) {
    const posList = positions.split(",");
    const placeholders = posList.map((_, i) => `$${params.length + 1 + i}`);
    sql += ` AND cm.position IN (${placeholders.join(",")})`;
    params.push(...posList);
  }

  if (clubId) {
    sql += ` AND c.id = $${params.length + 1}`;
    params.push(clubId);
  }

  sql += " ORDER BY ps.goals DESC NULLS LAST, u.global_name ASC LIMIT 50";

  try {
    const result = await query(sql, params);
    return NextResponse.json({ players: result.rows });
  } catch (error) {
    console.error("Players fetch error:", error);
    return NextResponse.json({ players: [] });
  }
}
