import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { leagueId } = await params;

  try {
    const body = await request.json();
    const { name, season, start_date, end_date, is_active } = body;

    if (is_active === true) {
      await query("UPDATE leagues SET is_active = false WHERE is_active = true");
    }

    const result = await query(
      `UPDATE leagues
       SET name = COALESCE($1, name),
           season = COALESCE($2, season),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [name, season, start_date, end_date, is_active, leagueId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json({ league: result.rows[0] });
  } catch (error) {
    console.error("Admin update league error:", error);
    return NextResponse.json({ error: "Failed to update league" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { leagueId } = await params;

  try {
    await query("DELETE FROM leagues WHERE id = $1", [leagueId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete league error:", error);
    return NextResponse.json({ error: "Failed to delete league" }, { status: 500 });
  }
}
