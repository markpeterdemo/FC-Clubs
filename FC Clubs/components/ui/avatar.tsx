import { cn } from "@/lib/utils";
import { getDiscordAvatarUrl } from "@/lib/discord";

interface DiscordAvatarProps {
  discordId: string;
  avatarHash: string | null;
  size?: number;
  className?: string;
}

export function DiscordAvatar({ discordId, avatarHash, size = 40, className }: DiscordAvatarProps) {
  const src = getDiscordAvatarUrl(discordId, avatarHash, size);

  return (
    <img
      src={src}
      alt=""
      className={cn("rounded-full shrink-0", className)}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
