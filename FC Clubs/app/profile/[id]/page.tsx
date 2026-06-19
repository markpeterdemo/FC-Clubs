import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ProfileCard } from "@/components/profile-card";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query(
    "SELECT discord_id, global_name, username, avatar FROM users WHERE id = $1 AND public_profile = true",
    [id]
  );

  if (result.rows.length === 0) return { title: "Profile — Matchday" };

  const user = result.rows[0];
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=256`
    : null;

  return {
    title: `${user.global_name || user.username} (@${user.username}) — Matchday`,
    description: `Check out ${user.global_name || user.username}'s profile on Matchday`,
    openGraph: {
      title: `${user.global_name || user.username} — Matchday`,
      description: `View profile on Matchday`,
      images: avatarUrl ? [{ url: avatarUrl, width: 256, height: 256 }] : [],
    },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getSession();
  const isOwnProfile = session?.userId === id;

  const userResult = await query(
    "SELECT id, discord_id, username, global_name, avatar, banner, public_profile, position, created_at FROM users WHERE id = $1",
    [id]
  );

  if (userResult.rows.length === 0) notFound();

  const user = userResult.rows[0];

  if (!user.public_profile && !isOwnProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile Private</h1>
          <p className="mt-2 text-text-secondary">This user has set their profile to private.</p>
        </div>
      </div>
    );
  }

  const clubResult = await query(
    `SELECT c.id, c.name, c.short_name, c.logo_url, c.primary_color, c.visibility,
            cm.role, cm.position, cm.joined_at
     FROM club_members cm
     JOIN clubs c ON c.id = cm.club_id
     WHERE cm.user_id = $1
     LIMIT 1`,
    [id]
  );

  const club = clubResult.rows[0] || null;

  let stats = null;
  if (club) {
    const statsResult = await query(
      `SELECT cs.played, cs.wins, cs.draws, cs.losses, cs.goals_for, cs.goals_against
       FROM club_stats cs
       WHERE cs.club_id = $1
       ORDER BY cs.season DESC
       LIMIT 1`,
      [club.id]
    );
    stats = statsResult.rows[0] || null;

    const playerStatsResult = await query(
      `SELECT
         COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'goal' AND me.player_id = $1)::int as goals,
         COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'assist' AND me.player_id = $1)::int as assists,
         COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'yellow_card' AND me.player_id = $1)::int as yellow_cards,
         COUNT(DISTINCT me.id) FILTER (WHERE me.type = 'red_card' AND me.player_id = $1)::int as red_cards,
         COUNT(DISTINCT ml.id)::int as apps
       FROM match_events me
       FULL JOIN match_lineups ml ON ml.player_id = $1
       WHERE me.player_id = $1 OR ml.player_id = $1`,
      [id]
    );
    stats = { ...stats, ...playerStatsResult.rows[0] };
  }

  return (
    <div className="py-8 animate-fade-in">
      <div className="mx-auto max-w-lg">
        <ProfileCard user={user} club={club} stats={stats} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  );
}
