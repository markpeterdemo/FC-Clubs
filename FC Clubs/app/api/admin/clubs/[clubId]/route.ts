import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { clubId } = await params;

  try {
    await query("DELETE FROM clubs WHERE id = $1", [clubId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete club error:", error);
    return NextResponse.json({ error: "Failed to delete club" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { clubId } = await params;

  try {
    const body = await request.json();
    const { name, short_name, primary_color, visibility, description } = body;

    const result = await query(
      `UPDATE clubs
       SET name = COALESCE($1, name),
           short_name = COALESCE($2, short_name),
           primary_color = COALESCE($3, primary_color),
           visibility = COALESCE($4, visibility),
           description = COALESCE($5, description)
       WHERE id = $6
       RETURNING *`,
      [name, short_name, primary_color, visibility, description, clubId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json({ club: result.rows[0] });
  } catch (error) {
    console.error("Admin update club error:", error);
    return NextResponse.json({ error: "Failed to update club" }, { status: 500 });
  }
}
