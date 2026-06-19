import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getActiveSeason } from "@/lib/season";

// GET /api/clubs - list clubs (with optional search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const visibility = searchParams.get("visibility");

  let sql = `
    SELECT c.*, COUNT(cm.id)::int as member_count
    FROM clubs c
    LEFT JOIN club_members cm ON cm.club_id = c.id
  `;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (q) {
    conditions.push(`c.name ILIKE $${params.length + 1}`);
    params.push(`%${q}%`);
  }

  if (visibility) {
    conditions.push(`c.visibility = $${params.length + 1}`);
    params.push(visibility);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " GROUP BY c.id ORDER BY c.name ASC LIMIT 20";

  try {
    const result = await query(sql, params);
    return NextResponse.json({ clubs: result.rows });
  } catch (error) {
    console.error("Clubs fetch error:", error);
    return NextResponse.json({ clubs: [] });
  }
}

// POST /api/clubs - create a club
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, short_name, primary_color, position, role } = body;

    if (!name || !position) {
      return NextResponse.json({ error: "Name and position are required" }, { status: 400 });
    }

    const existingMember = await query(
      "SELECT id FROM club_members WHERE user_id = $1 LIMIT 1",
      [session.userId]
    );

    if (existingMember.rows.length > 0) {
      return NextResponse.json({ error: "You are already in a club" }, { status: 400 });
    }

    const clubResult = await query(
      `INSERT INTO clubs (name, short_name, primary_color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, short_name || null, primary_color || "#22c55e"]
    );

    const club = clubResult.rows[0];

    await query(
      `INSERT INTO club_members (user_id, club_id, role, position)
       VALUES ($1, $2, 'captain', $3)`,
      [session.userId, club.id, position]
    );

    const season = await getActiveSeason();
    await query(
      `INSERT INTO club_stats (club_id, season)
       VALUES ($1, $2)`,
      [club.id, season]
    );

    return NextResponse.json({ club });
  } catch (error) {
    console.error("Club create error:", error);
    return NextResponse.json({ error: "Failed to create club" }, { status: 500 });
  }
}
