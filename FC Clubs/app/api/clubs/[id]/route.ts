import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query("SELECT * FROM clubs WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }
    return NextResponse.json({ club: result.rows[0] });
  } catch (error) {
    console.error("Club fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch club" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberResult = await query(
    "SELECT role FROM club_members WHERE user_id = $1 AND club_id = $2",
    [session.userId, id]
  );

  if (memberResult.rows.length === 0 || memberResult.rows[0].role !== "captain") {
    return NextResponse.json({ error: "Only the captain can edit settings" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, short_name, primary_color, visibility, max_members, description } = body;

    const result = await query(
      `UPDATE clubs
       SET name = COALESCE($1, name),
           short_name = COALESCE($2, short_name),
           primary_color = COALESCE($3, primary_color),
           visibility = COALESCE($4, visibility),
           max_members = COALESCE($5, max_members),
           description = COALESCE($6, description)
       WHERE id = $7
       RETURNING *`,
      [name, short_name, primary_color, visibility, max_members, description, id]
    );

    return NextResponse.json({ club: result.rows[0] });
  } catch (error) {
    console.error("Club update error:", error);
    return NextResponse.json({ error: "Failed to update club" }, { status: 500 });
  }
}
