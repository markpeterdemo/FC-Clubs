import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { userId } = await params;

  try {
    const body = await request.json();
    const { is_admin, banned } = body;

    const result = await query(
      `UPDATE users
       SET is_admin = COALESCE($1, is_admin),
           banned = COALESCE($2, banned)
       WHERE id = $3
       RETURNING id, username, is_admin, banned`,
      [is_admin, banned, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
