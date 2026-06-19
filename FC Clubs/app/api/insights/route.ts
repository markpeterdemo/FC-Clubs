import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getFormInsights, predictMatch, suggestBestLineup } from "@/lib/insights";

// GET /api/insights?club_id=xxx — get insights for a club
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("club_id");
  const type = searchParams.get("type") || "form"; // form | predict | lineup

  if (!clubId) {
    return NextResponse.json({ error: "club_id required" }, { status: 400 });
  }

  try {
    // Get club info
    const clubResult = await query("SELECT * FROM clubs WHERE id = $1", [clubId]);
    if (clubResult.rows.length === 0) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }
    const club = clubResult.rows[0];

    // Get club stats
    const statsResult = await query(
      "SELECT * FROM club_stats WHERE club_id = $1 ORDER BY season DESC LIMIT 1",
      [clubId]
    );
    const stats = statsResult.rows[0] || null;

    if (!stats) {
      return NextResponse.json({ insights: [], prediction: null, lineup: [] });
    }

    // Get form
    const formResult = await query(
      `SELECT m.home_score, m.away_score, m.home_club_id
       FROM matches m
       WHERE (m.home_club_id = $1 OR m.away_club_id = $1)
         AND m.status = 'completed'
       ORDER BY m.match_date DESC
       LIMIT 5`,
      [clubId]
    );

    const form = formResult.rows.map((r) => {
      const isHome = r.home_club_id === clubId;
      const homeScore = Number(r.home_score);
      const awayScore = Number(r.away_score);
      return {
        won: isHome ? homeScore > awayScore : awayScore > homeScore,
        drew: homeScore === awayScore,
        is_home: isHome,
      };
    });

    if (type === "form") {
      // Get all club stats for comparison
      const allStatsResult = await query(`
        SELECT cs.*, c.name as club_name, c.id as club_id
        FROM club_stats cs
        JOIN clubs c ON c.id = cs.club_id
        WHERE cs.season = (SELECT season FROM club_stats WHERE club_id = $1 ORDER BY season DESC LIMIT 1)
      `, [clubId]);

      const statsData = {
        played: stats.played,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goals_for: stats.goals_for,
        goals_against: stats.goals_against,
        club_id: clubId,
      };

      const insights = getFormInsights(
        club.name,
        statsData,
        form,
        allStatsResult.rows.map((r) => ({
          club_id: r.club_id,
          played: r.played,
          wins: r.wins,
          draws: r.draws,
          losses: r.losses,
          goals_for: r.goals_for,
          goals_against: r.goals_against,
        }))
      );

      return NextResponse.json({ insights });
    }

    if (type === "predict") {
      const opponentId = searchParams.get("opponent_id");
      if (!opponentId) {
        return NextResponse.json({ error: "opponent_id required for prediction" }, { status: 400 });
      }

      const oppStatsResult = await query(
        "SELECT * FROM club_stats WHERE club_id = $1 ORDER BY season DESC LIMIT 1",
        [opponentId]
      );
      const oppStats = oppStatsResult.rows[0] || null;

      const homeStats = { played: stats.played, wins: stats.wins, draws: stats.draws, losses: stats.losses, goals_for: stats.goals_for, goals_against: stats.goals_against };
      const awayStats = oppStats ? { played: oppStats.played, wins: oppStats.wins, draws: oppStats.draws, losses: oppStats.losses, goals_for: oppStats.goals_for, goals_against: oppStats.goals_against } : { played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0 };

      const prediction = predictMatch(homeStats, awayStats);
      return NextResponse.json({ prediction });
    }

    if (type === "lineup") {
      const formation = searchParams.get("formation") || "4-3-3";
      const slots = {
        "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "LW", "RW", "ST"],
        "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
        "3-5-2": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "CM", "RM", "ST", "ST"],
      }[formation] || ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "LW", "RW", "ST"];

      const membersResult = await query(
        `SELECT u.id as user_id, u.global_name, cm.position,
                COALESCE(ps.goals, 0)::int as goals,
                COALESCE(ps.assists, 0)::int as assists,
                COALESCE(ps.apps, 0)::int as apps
         FROM club_members cm
         JOIN users u ON u.id = cm.user_id
         LEFT JOIN (
           SELECT ml.player_id,
                  COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'goal')::int as goals,
                  COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'assist')::int as assists,
                  COUNT(DISTINCT ml.id)::int as apps
           FROM match_lineups ml
           LEFT JOIN match_events me ON me.player_id = ml.player_id
           GROUP BY ml.player_id
         ) ps ON ps.player_id = u.id
         WHERE cm.club_id = $1`,
        [clubId]
      );

      const lineup = suggestBestLineup(membersResult.rows, slots);
      return NextResponse.json({ lineup, formation });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to get insights" }, { status: 500 });
  }
}
