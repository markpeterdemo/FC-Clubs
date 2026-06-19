import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET invites for current user (as recipient)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ invites: [] }, { status: 401 });

  try {
    const result = await query(
      `SELECT i.*, c.name as club_name, c.short_name as club_short,
              c.primary_color as club_color, c.logo_url as club_logo,
              u.username as sender_name, u.global_name as sender_global
       FROM invites i
       JOIN clubs c ON c.id = i.club_id
       JOIN users u ON u.id = i.sender_id
       WHERE i.recipient_id = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [session.userId]
    );

    return NextResponse.json({ invites: result.rows });
  } catch (error) {
    console.error("Invites fetch error:", error);
    return NextResponse.json({ invites: [] });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipient_id, message } = await request.json();

    if (!recipient_id) {
      return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
    }

    const memberResult = await query(
      "SELECT club_id, role FROM club_members WHERE user_id = $1",
      [session.userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: "You are not in a club" }, { status: 400 });
    }

    const { club_id, role } = memberResult.rows[0];
    if (role !== "captain" && role !== "manager") {
      return NextResponse.json({ error: "Only captains and managers can invite" }, { status: 403 });
    }

    const existing = await query(
      `SELECT id FROM invites
       WHERE sender_id = $1 AND recipient_id = $2 AND club_id = $3 AND status = 'pending'`,
      [session.userId, recipient_id, club_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
    }

    const existingMembership = await query(
      "SELECT id FROM club_members WHERE user_id = $1 AND club_id = $2",
      [recipient_id, club_id]
    );

    if (existingMembership.rows.length > 0) {
      return NextResponse.json({ error: "Player is already in your club" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO invites (sender_id, recipient_id, club_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [session.userId, recipient_id, club_id, message || null]
    );

    await query(
      `INSERT INTO notifications (user_id, type, reference_id, message)
       VALUES ($1, 'invite', $2, $3)`,
      [
        recipient_id,
        result.rows[0].id,
        `You've been invited to join a club!`,
      ]
    );

    return NextResponse.json({ invite: result.rows[0] });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
