import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = await query("SELECT * FROM leagues ORDER BY is_active DESC, created_at DESC");
    return NextResponse.json({ leagues: result.rows });
  } catch (error) {
    console.error("Admin leagues error:", error);
    return NextResponse.json({ leagues: [] });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, season, start_date, end_date } = body;

    if (!name || !season) {
      return NextResponse.json({ error: "Name and season are required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO leagues (name, season, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, season, start_date || null, end_date || null]
    );

    return NextResponse.json({ league: result.rows[0] });
  } catch (error) {
    console.error("Admin create league error:", error);
    return NextResponse.json({ error: "Failed to create league" }, { status: 500 });
  }
}
