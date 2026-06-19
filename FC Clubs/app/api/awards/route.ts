import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/awards — get season awards
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") || "Spring 2025";

  try {
    const result = await query(
      `SELECT sa.*, u.username, u.global_name, u.discord_id, u.avatar,
              c.name as club_name, c.short_name as club_short_name, c.primary_color as club_color
       FROM season_awards sa
       JOIN users u ON u.id = sa.player_id
       LEFT JOIN club_members cm ON cm.user_id = sa.player_id
       LEFT JOIN clubs c ON c.id = cm.club_id
       WHERE sa.season = $1
       ORDER BY sa.award_key ASC`,
      [season]
    );

    return NextResponse.json({ awards: result.rows });
  } catch (error) {
    console.error("Awards fetch error:", error);
    return NextResponse.json({ awards: [] });
  }
}

// POST /api/awards/calculate — auto-calculate season awards (admin)
export async function POST(request: Request) {
  try {
    const { season } = await request.json();
    const currentSeason = season || "Spring 2025";

    // Clear existing awards for this season
    await query("DELETE FROM season_awards WHERE season = $1", [currentSeason]);

    const awards: { award_key: string; player_id: string; value: number }[] = [];

    // Golden Boot — most goals
    const topScorers = await query(`
      SELECT me.player_id, COUNT(*)::int as goals
      FROM match_events me
      JOIN matches m ON m.id = me.match_id
      WHERE me.type = 'goal'
      GROUP BY me.player_id
      ORDER BY goals DESC
      LIMIT 1
    `);
    if (topScorers.rows.length > 0) {
      awards.push({ award_key: "golden_boot", player_id: topScorers.rows[0].player_id, value: topScorers.rows[0].goals });
    }

    // Playmaker — most assists
    const topAssists = await query(`
      SELECT me.player_id, COUNT(*)::int as assists
      FROM match_events me
      JOIN matches m ON m.id = me.match_id
      WHERE me.type = 'assist'
      GROUP BY me.player_id
      ORDER BY assists DESC
      LIMIT 1
    `);
    if (topAssists.rows.length > 0) {
      awards.push({ award_key: "playmaker", player_id: topAssists.rows[0].player_id, value: topAssists.rows[0].assists });
    }

    // Iron Man — most appearances
    const topApps = await query(`
      SELECT ml.player_id, COUNT(*)::int as apps
      FROM match_lineups ml
      JOIN matches m ON m.id = ml.match_id
      GROUP BY ml.player_id
      ORDER BY apps DESC
      LIMIT 1
    `);
    if (topApps.rows.length > 0) {
      awards.push({ award_key: "iron_man", player_id: topApps.rows[0].player_id, value: topApps.rows[0].apps });
    }

    // Insert all awards
    for (const award of awards) {
      await query(
        "INSERT INTO season_awards (season, award_key, player_id, value) VALUES ($1, $2, $3, $4)",
        [currentSeason, award.award_key, award.player_id, award.value]
      );
    }

    // Create notifications for winners
    for (const award of awards) {
      const awardName = award.award_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      await query(
        `INSERT INTO notifications (user_id, type, reference_id, message)
         VALUES ($1, 'award', $2, $3)`,
        [award.player_id, currentSeason, `🏆 You won the ${awardName} award for ${currentSeason}!`]
      );
    }

    return NextResponse.json({ awards });
  } catch (error) {
    console.error("Awards calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate awards" }, { status: 500 });
  }
}
