import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/achievements?user_id=xxx — get user's earned achievements
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ achievements: [] });
  }

  try {
    const result = await query(
      "SELECT * FROM player_achievements WHERE user_id = $1 ORDER BY unlocked_at DESC",
      [userId]
    );
    return NextResponse.json({ achievements: result.rows });
  } catch (error) {
    console.error("Achievements fetch error:", error);
    return NextResponse.json({ achievements: [] });
  }
}

// POST /api/achievements/check — run after match report to check/unlock badges
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { match_id, player_stats } = await request.json();
    const unlocked: { user_id: string; badge_key: string }[] = [];

    // Check achievements for each player in the match
    for (const stats of player_stats || []) {
      const existing = await query(
        "SELECT badge_key FROM player_achievements WHERE user_id = $1",
        [stats.user_id]
      );
      const earned = new Set(existing.rows.map((r: any) => r.badge_key));

      // First appearance
      if (!earned.has("first_appearance")) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'first_appearance', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "first_appearance" });
      }

      // First goal
      if (!earned.has("first_goal") && stats.goals >= 1) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'first_goal', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "first_goal" });
      }

      // Brace
      if (!earned.has("brace") && stats.goals >= 2) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'brace', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "brace" });
      }

      // Hat trick
      if (!earned.has("hat_trick") && stats.goals >= 3) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'hat_trick', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "hat_trick" });
      }

      // Five goals
      if (!earned.has("five_goals") && stats.goals >= 5) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'five_goals', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "five_goals" });
      }

      // Assist king
      if (!earned.has("assist_king") && stats.assists >= 3) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'assist_king', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "assist_king" });
      }

      // Comeback kid (won after being 2+ down)
      if (!earned.has("comeback_kid") && stats.came_back_from_2_down) {
        await query(
          "INSERT INTO player_achievements (user_id, badge_key, match_id) VALUES ($1, 'comeback_kid', $2) ON CONFLICT DO NOTHING",
          [stats.user_id, match_id]
        );
        unlocked.push({ user_id: stats.user_id, badge_key: "comeback_kid" });
      }
    }

    return NextResponse.json({ unlocked });
  } catch (error) {
    console.error("Achievements check error:", error);
    return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
  }
}
