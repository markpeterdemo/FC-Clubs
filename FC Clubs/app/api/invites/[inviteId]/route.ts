import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteId } = await params;

  try {
    const { status } = await request.json();
    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const inviteResult = await query(
      "SELECT * FROM invites WHERE id = $1 AND recipient_id = $2 AND status = 'pending'",
      [inviteId, session.userId]
    );

    if (inviteResult.rows.length === 0) {
      return NextResponse.json({ error: "Invite not found or already processed" }, { status: 404 });
    }

    const invite = inviteResult.rows[0];

    const result = await query(
      "UPDATE invites SET status = $1 WHERE id = $2 RETURNING *",
      [status, inviteId]
    );

    if (status === "accepted") {
      const existingMember = await query(
        "SELECT id FROM club_members WHERE user_id = $1 AND club_id = $2",
        [session.userId, invite.club_id]
      );

      if (existingMember.rows.length === 0) {
        await query(
          `INSERT INTO club_members (user_id, club_id, role)
           VALUES ($1, $2, 'player')`,
          [session.userId, invite.club_id]
        );

        const captainResult = await query(
          "SELECT user_id FROM club_members WHERE club_id = $1 AND role = 'captain'",
          [invite.club_id]
        );

        for (const captain of captainResult.rows) {
          await query(
            `INSERT INTO notifications (user_id, type, reference_id, message)
             VALUES ($1, 'invite_accepted', $2, 'A player has accepted your invite and joined the club.')`,
            [captain.user_id, invite.club_id]
          );
        }
      }
    }

    return NextResponse.json({ invite: result.rows[0] });
  } catch (error) {
    console.error("Invite update error:", error);
    return NextResponse.json({ error: "Failed to process invite" }, { status: 500 });
  }
}
