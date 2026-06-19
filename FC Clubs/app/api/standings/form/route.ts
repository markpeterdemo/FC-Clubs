import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT
        m.id,
        m.home_club_id, m.away_club_id,
        m.home_score, m.away_score, m.match_date
      FROM matches m
      WHERE m.status = 'completed'
      ORDER BY m.match_date DESC
    `);

    // Group by club, keep last 5
    const formMap: Record<string, any[]> = {};

    for (const row of result.rows) {
      const clubs = [row.home_club_id, row.away_club_id];
      for (const clubId of clubs) {
        if (!formMap[clubId]) formMap[clubId] = [];

        if (formMap[clubId].length >= 5) continue;

        const isHome = row.home_club_id === clubId;
        const homeScore = Number(row.home_score);
        const awayScore = Number(row.away_score);

        formMap[clubId].push({
          won: isHome ? homeScore > awayScore : awayScore > homeScore,
          drew: homeScore === awayScore,
          home_score: homeScore,
          away_score: awayScore,
          is_home: isHome,
        });
      }
    }

    return NextResponse.json({ formMap });
  } catch (error) {
    console.error("Standings form error:", error);
    return NextResponse.json({ formMap: {} });
  }
}
