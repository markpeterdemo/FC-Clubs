import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT c.*, COUNT(cm.id)::int as member_count
      FROM clubs c
      LEFT JOIN club_members cm ON cm.club_id = c.id
    `;
    const params: unknown[] = [];

    if (q) {
      sql += ` WHERE c.name ILIKE $1`;
      params.push(`%${q}%`);
    }

    sql += " GROUP BY c.id ORDER BY c.created_at DESC LIMIT $2 OFFSET $3";
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      q
        ? "SELECT COUNT(*)::int as count FROM clubs WHERE name ILIKE $1"
        : "SELECT COUNT(*)::int as count FROM clubs",
      q ? [`%${q}%`] : []
    );

    return NextResponse.json({
      clubs: result.rows,
      total: countResult.rows[0].count,
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Admin clubs error:", error);
    return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }
}
