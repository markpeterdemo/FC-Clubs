import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT m.*,
        h.name as home_name, h.short_name as home_short, h.primary_color as home_color,
        a.name as away_name, a.short_name as away_short, a.primary_color as away_color
      FROM matches m
      JOIN clubs h ON h.id = m.home_club_id
      JOIN clubs a ON a.id = m.away_club_id
    `;
    const params: unknown[] = [];

    if (status) {
      sql += ` WHERE m.status = $1`;
      params.push(status);
    }

    sql += " ORDER BY m.match_date DESC LIMIT $2 OFFSET $3";
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      status
        ? "SELECT COUNT(*)::int as count FROM matches WHERE status = $1"
        : "SELECT COUNT(*)::int as count FROM matches",
      status ? [status] : []
    );

    return NextResponse.json({
      matches: result.rows,
      total: countResult.rows[0].count,
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Admin matches error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
