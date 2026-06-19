import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query(
      `SELECT m.home_score, m.away_score, m.match_date, m.home_club_id,
              hc.short_name as home_short, ac.short_name as away_short
       FROM matches m
       JOIN clubs hc ON hc.id = m.home_club_id
       JOIN clubs ac ON ac.id = m.away_club_id
       WHERE (m.home_club_id = $1 OR m.away_club_id = $1)
         AND m.status = 'completed'
       ORDER BY m.match_date DESC
       LIMIT 5`,
      [id]
    );

    const form = result.rows.map((m) => {
      const isHome = m.home_club_id === id;
      return {
        won: isHome
          ? Number(m.home_score) > Number(m.away_score)
          : Number(m.away_score) > Number(m.home_score),
        drew: Number(m.home_score) === Number(m.away_score),
        home_score: Number(m.home_score),
        away_score: Number(m.away_score),
        is_home: isHome,
        opponent_short: isHome ? m.away_short : m.home_short,
        match_date: m.match_date,
      };
    });

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Form fetch error:", error);
    return NextResponse.json({ form: [] });
  }
}

// GET all clubs form (for standings)
export async function getAllClubsForm() {
  try {
    const result = await query(`
      SELECT DISTINCT ON (m.id, sub.club_id)
        sub.club_id,
        m.home_score, m.away_score, m.match_date, m.home_club_id,
        hc.short_name as home_short, ac.short_name as away_short
      FROM matches m
      JOIN clubs hc ON hc.id = m.home_club_id
      JOIN clubs ac ON ac.id = m.away_club_id
      JOIN LATERAL (
        SELECT unnest(ARRAY[m.home_club_id, m.away_club_id]) AS club_id
      ) sub ON true
      WHERE m.status = 'completed'
      ORDER BY sub.club_id, m.match_date DESC
    `);

    // Group by club, take last 5
    const formMap = new Map<string, any[]>();
    for (const row of result.rows) {
      if (!formMap.has(row.club_id)) {
        formMap.set(row.club_id, []);
      }
      const list = formMap.get(row.club_id)!;
      if (list.length < 5) {
        const isHome = row.home_club_id === row.club_id;
        list.push({
          won: isHome
            ? Number(row.home_score) > Number(row.away_score)
            : Number(row.away_score) > Number(row.home_score),
          drew: Number(row.home_score) === Number(row.away_score),
          home_score: Number(row.home_score),
          away_score: Number(row.away_score),
          is_home: isHome,
          opponent_short: isHome ? row.away_short : row.home_short,
          match_date: row.match_date,
        });
      }
    }

    return formMap;
  } catch {
    return new Map();
  }
}
