export function getDiscordAvatarUrl(discordId: string, avatarHash: string | null, size = 256): string {
  if (!avatarHash) {
    const defaultIndex = Math.abs(Number(discordId)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  const isAnimated = avatarHash.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=${size}`;
}

export function getDiscordBannerUrl(discordId: string, bannerHash: string | null, size = 480): string | null {
  if (!bannerHash) return null;
  const isAnimated = bannerHash.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${discordId}/${bannerHash}.${ext}?size=${size}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}
