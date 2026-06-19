import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { ClubPageClient } from "@/components/club-page-client";

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const clubResult = await query("SELECT * FROM clubs WHERE id = $1", [id]);
  if (clubResult.rows.length === 0) notFound();
  const club = clubResult.rows[0];

  const membersResult = await query(
    `SELECT u.id as user_id, u.discord_id, u.username, u.global_name, u.avatar,
            cm.role, cm.position, cm.joined_at
     FROM club_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.club_id = $1
     ORDER BY cm.role = 'captain' DESC, cm.role = 'manager' DESC, cm.joined_at ASC`,
    [id]
  );

  const statsResult = await query(
    "SELECT * FROM club_stats WHERE club_id = $1 ORDER BY season DESC LIMIT 1",
    [id]
  );

  const matchesResult = await query(
    `SELECT m.*, hc.name as home_name, hc.short_name as home_short, hc.primary_color as home_color,
            ac.name as away_name, ac.short_name as away_short, ac.primary_color as away_color
     FROM matches m
     JOIN clubs hc ON hc.id = m.home_club_id
     JOIN clubs ac ON ac.id = m.away_club_id
     WHERE m.home_club_id = $1 OR m.away_club_id = $1
     ORDER BY m.match_date DESC
     LIMIT 5`,
    [id]
  );

  const members = membersResult.rows;
  const stats = statsResult.rows[0] || null;
  const matches = matchesResult.rows;

  return (
    <ClubPageClient
      club={club}
      members={members}
      stats={stats}
      matches={matches}
    />
  );
}
