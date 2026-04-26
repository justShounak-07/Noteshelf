import Image from "next/image";

interface UserAvatarProps {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
  size?: number;
  className?: string;
}

export default function UserAvatar({ user, size = 32, className = "" }: UserAvatarProps) {
  if (user?.image) {
    return (
      <div 
        className={`rounded-full overflow-hidden flex-shrink-0 bg-border border border-border ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={user.image}
          alt={user.name || "Avatar"}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback to monogram
  const initial = user?.name ? user.name[0].toUpperCase() : "?";

  return (
    <div
      className={`rounded-full flex-shrink-0 flex items-center justify-center bg-[#E5E5E5] text-[#0F0F0F] border border-border ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.45),
        fontFamily: "var(--font-heading)",
        fontWeight: 600,
      }}
    >
      {initial}
    </div>
  );
}
