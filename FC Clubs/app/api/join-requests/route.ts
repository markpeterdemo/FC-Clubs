import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ requests: [] }, { status: 401 });
  }

  try {
    const memberResult = await query(
      "SELECT club_id FROM club_members WHERE user_id = $1 AND (role = 'captain' OR role = 'manager')",
      [session.userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    const result = await query(
      `SELECT jr.*, u.discord_id, u.username, u.global_name, u.avatar
       FROM join_requests jr
       JOIN users u ON u.id = jr.user_id
       WHERE jr.club_id = $1 AND jr.status = 'pending'
       ORDER BY jr.created_at DESC`,
      [memberResult.rows[0].club_id]
    );

    return NextResponse.json({ requests: result.rows });
  } catch (error) {
    console.error("Join requests fetch error:", error);
    return NextResponse.json({ requests: [] });
  }
}
