import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Discord token error:", error);
      return NextResponse.redirect(new URL("/login?error=token_failed", request.url));
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=user_fetch_failed", request.url));
    }

    const discordUser = await userResponse.json();

    const result = await query(
      `INSERT INTO users (discord_id, username, email, avatar, global_name, access_token, refresh_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (discord_id)
       DO UPDATE SET
         username = EXCLUDED.username,
         email = EXCLUDED.email,
         avatar = EXCLUDED.avatar,
         global_name = EXCLUDED.global_name,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         updated_at = now()
       RETURNING id, discord_id`,
      [
        discordUser.id,
        discordUser.username,
        discordUser.email,
        discordUser.avatar,
        discordUser.global_name,
        access_token,
        refresh_token,
      ]
    );

    const user = result.rows[0];
    const token = await createSession({ userId: user.id, discordId: user.discord_id });

    const memberResult = await query(
      "SELECT id FROM club_members WHERE user_id = $1 LIMIT 1",
      [user.id]
    );

    const destination = memberResult.rows.length === 0 ? "/join" : "/dashboard";
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set("session", token, sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=unknown", request.url));
  }
}
