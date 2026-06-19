import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const memberResult = await query(
      "SELECT club_id FROM club_members WHERE user_id = $1 AND (role = 'captain' OR role = 'manager')",
      [session.userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const result = await query(
      "SELECT COUNT(*)::int as count FROM join_requests WHERE club_id = $1 AND status = 'pending'",
      [memberResult.rows[0].club_id]
    );

    return NextResponse.json({ count: result.rows[0].count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
