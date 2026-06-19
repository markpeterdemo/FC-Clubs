import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { position, public_profile } = body;

    const result = await query(
      `UPDATE users
       SET position = COALESCE($1, position),
           public_profile = COALESCE($2, public_profile)
       WHERE id = $3
       RETURNING id, username, global_name, avatar, position, public_profile`,
      [position, public_profile, session.userId]
    );

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
