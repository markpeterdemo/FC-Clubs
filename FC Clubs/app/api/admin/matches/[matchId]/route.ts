import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getActiveSeason } from "@/lib/season";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { matchId } = await params;

  try {
    const body = await request.json();
    const { home_score, away_score, status, match_date } = body;

    if (home_score !== undefined || away_score !== undefined) {
      if (home_score === null || away_score === null || home_score < 0 || away_score < 0) {
        return NextResponse.json({ error: "Invalid score" }, { status: 400 });
      }
    }

    const result = await query(
      `UPDATE matches
       SET home_score = COALESCE($1, home_score),
           away_score = COALESCE($2, away_score),
           status = COALESCE($3, status),
           match_date = COALESCE($4, match_date)
       WHERE id = $5
       RETURNING *`,
      [home_score, away_score, status, match_date, matchId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const match = result.rows[0];

    // Update club_stats when match is completed
    if (status === "completed" && home_score !== undefined && away_score !== undefined) {
      const homeClub = match.home_club_id;
      const awayClub = match.away_club_id;
      const season = await getActiveSeason();

      for (const clubId of [homeClub, awayClub]) {
        const scoreFor = clubId === homeClub ? home_score : away_score;
        const scoreAgainst = clubId === homeClub ? away_score : home_score;
        await query(
          `INSERT INTO club_stats (club_id, season, played, wins, draws, losses, goals_for, goals_against)
           VALUES ($1, $2, 1,
             CASE WHEN $3 > $4 THEN 1 ELSE 0 END,
             CASE WHEN $3 = $4 THEN 1 ELSE 0 END,
             CASE WHEN $3 < $4 THEN 1 ELSE 0 END,
             $3, $4)
           ON CONFLICT (club_id, season)
           DO UPDATE SET
             played = club_stats.played + 1,
             wins = club_stats.wins + (CASE WHEN $3 > $4 THEN 1 ELSE 0 END),
             draws = club_stats.draws + (CASE WHEN $3 = $4 THEN 1 ELSE 0 END),
             losses = club_stats.losses + (CASE WHEN $3 < $4 THEN 1 ELSE 0 END),
             goals_for = club_stats.goals_for + $3,
             goals_against = club_stats.goals_against + $4`,
          [clubId, season, scoreFor, scoreAgainst]
        );
      }
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Admin update match error:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { matchId } = await params;

  try {
    await query("DELETE FROM matches WHERE id = $1", [matchId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete match error:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
