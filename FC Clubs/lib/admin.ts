import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  const { query } = await import("@/lib/db");
  const result = await query("SELECT is_admin FROM users WHERE id = $1 AND banned = false", [session.userId]);

  if (result.rows.length === 0 || !result.rows[0].is_admin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
