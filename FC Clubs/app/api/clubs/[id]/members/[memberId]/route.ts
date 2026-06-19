import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberResult = await query(
    "SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2",
    [session.userId, id]
  );

  if (memberResult.rows.length === 0 || memberResult.rows[0].role !== "captain") {
    return NextResponse.json({ error: "Only the captain can remove members" }, { status: 403 });
  }

  try {
    await query(
      "DELETE FROM club_members WHERE user_id = $1 AND club_id = $2",
      [memberId, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
