import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { club_id, away_club_id, formation, formation_away, starters, subs } = body;

    if (!away_club_id) {
      return NextResponse.json({ error: "Opponent club is required" }, { status: 400 });
    }

    if (away_club_id === club_id) {
      return NextResponse.json({ error: "Cannot play against yourself" }, { status: 400 });
    }

    const matchResult = await query(
      `INSERT INTO matches (home_club_id, away_club_id, match_date, formation_home, formation_away, status)
       VALUES ($1, $2, now(), $3, $4, 'scheduled')
       RETURNING *`,
      [club_id, away_club_id, formation, formation_away || null]
    );

    const match = matchResult.rows[0];

    if (starters) {
      for (const starter of starters) {
        if (!starter.player_id) continue;
        await query(
          `INSERT INTO match_lineups (match_id, club_id, player_id, position, is_substitute)
           VALUES ($1, $2, $3, $4, false)`,
          [match.id, club_id, starter.player_id, starter.position]
        );
      }
    }

    if (subs) {
      for (const sub of subs) {
        if (!sub.player_id) continue;
        await query(
          `INSERT INTO match_lineups (match_id, club_id, player_id, position, is_substitute)
           VALUES ($1, $2, $3, $4, true)`,
          [match.id, club_id, sub.player_id, sub.position]
        );
      }
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Match create error:", error);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await query(`
      SELECT m.*,
        h.name as home_name, h.short_name as home_short, h.primary_color as home_color,
        a.name as away_name, a.short_name as away_short, a.primary_color as away_color
      FROM matches m
      JOIN clubs h ON h.id = m.home_club_id
      JOIN clubs a ON a.id = m.away_club_id
      WHERE m.status = 'scheduled'
      ORDER BY m.match_date ASC
    `);
    return NextResponse.json({ matches: result.rows });
  } catch (error) {
    console.error("Matches fetch error:", error);
    return NextResponse.json({ matches: [] });
  }
}
