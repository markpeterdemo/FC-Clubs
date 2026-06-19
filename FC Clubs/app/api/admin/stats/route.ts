import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [users, clubs, matches, completed] = await Promise.all([
      query("SELECT COUNT(*)::int as count FROM users"),
      query("SELECT COUNT(*)::int as count FROM clubs"),
      query("SELECT COUNT(*)::int as count FROM matches"),
      query("SELECT COUNT(*)::int as count FROM matches WHERE status = 'completed'"),
    ]);

    return NextResponse.json({
      totalUsers: users.rows[0].count,
      totalClubs: clubs.rows[0].count,
      totalMatches: matches.rows[0].count,
      completedMatches: completed.rows[0].count,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
