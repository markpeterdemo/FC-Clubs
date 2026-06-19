import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query(
      `SELECT u.id as user_id, u.discord_id, u.username, u.global_name, u.avatar, u.public_profile,
              cm.role, cm.position, cm.joined_at
       FROM club_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.club_id = $1
       ORDER BY cm.role = 'captain' DESC, cm.role = 'manager' DESC, cm.joined_at ASC`,
      [id]
    );

    return NextResponse.json({ members: result.rows });
  } catch (error) {
    console.error("Members fetch error:", error);
    return NextResponse.json({ members: [] });
  }
}
