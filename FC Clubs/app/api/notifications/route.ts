import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  try {
    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [session.userId]
    );

    return NextResponse.json({ notifications: result.rows });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ notifications: [] });
  }
}
