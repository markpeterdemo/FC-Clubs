import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    const reqResult = await query(
      "SELECT * FROM join_requests WHERE id = $1",
      [requestId]
    );

    if (reqResult.rows.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const joinReq = reqResult.rows[0];

    const memberResult = await query(
      "SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2",
      [session.userId, joinReq.club_id]
    );

    if (memberResult.rows.length === 0 ||
        (memberResult.rows[0].role !== "captain" && memberResult.rows[0].role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query(
      "UPDATE join_requests SET status = $1 WHERE id = $2",
      [status, requestId]
    );

    if (status === "approved") {
      await query(
        `INSERT INTO club_members (user_id, club_id, role, position)
         VALUES ($1, $2, 'player', $3)`,
        [joinReq.user_id, joinReq.club_id, joinReq.position]
      );

      await query(
        `INSERT INTO notifications (user_id, type, reference_id, message)
         VALUES ($1, 'join_approved', $2, 'Your request to join the club was approved!')`,
        [joinReq.user_id, joinReq.club_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join request update error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
