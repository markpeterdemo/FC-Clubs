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
      SELECT u.id, u.discord_id, u.username, u.global_name, u.avatar,
             u.email, u.is_admin, u.banned, u.public_profile, u.created_at,
             cm.role as club_role, c.name as club_name, c.id as club_id
      FROM users u
      LEFT JOIN club_members cm ON cm.user_id = u.id
      LEFT JOIN clubs c ON c.id = cm.club_id
    `;
    const params: unknown[] = [];

    if (q) {
      sql += ` WHERE (u.username ILIKE $1 OR u.global_name ILIKE $1 OR u.discord_id ILIKE $1)`;
      params.push(`%${q}%`);
    }

    sql += " ORDER BY u.created_at DESC LIMIT $2 OFFSET $3";
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      q
        ? "SELECT COUNT(*)::int as count FROM users WHERE username ILIKE $1 OR global_name ILIKE $1 OR discord_id ILIKE $1"
        : "SELECT COUNT(*)::int as count FROM users",
      q ? [`%${q}%`] : []
    );

    return NextResponse.json({
      users: result.rows,
      total: countResult.rows[0].count,
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
