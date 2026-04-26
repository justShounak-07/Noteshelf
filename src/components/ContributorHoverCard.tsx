"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface ContributorHoverCardProps {
  user: {
    name?: string | null;
    image?: string | null;
    username?: string | null;
  } | null;
  children: React.ReactNode;
}

export default function ContributorHoverCard({ user, children }: ContributorHoverCardProps) {
  if (!user || !user.username) {
    return <>{children}</>;
  }

  return (
    <HoverCard.Root openDelay={400} closeDelay={200}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="w-[220px] bg-[#1E1E1E] border-[0.5px] border-[#2A2A2A] rounded-[10px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={8}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <UserAvatar size={40} user={user} />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] font-medium text-[#F0EDE6] truncate">{user.name}</span>
                <span className="text-[12px] text-[#8A8680] truncate">@{user.username}</span>
              </div>
            </div>

            <HoverCardStats username={user.username} />

            <Link href={`/profile/${user.username}`} className="text-[#5C8FFF] text-[12px] hover:underline mt-1 block">
              View profile &rarr;
            </Link>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

// Separate component for fetching stats so we don't block the trigger render
function HoverCardStats({ username }: { username: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["hover-stats", username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <div className="h-[14px] w-full animate-pulse bg-[#2A2A2A] rounded"></div>;
  }

  if (!data?.stats) return null;

  return (
    <div className="flex items-center justify-between gap-2 text-[12px]">
      <div className="flex flex-col text-center">
        <span className="text-[#F0EDE6] font-medium">{data.stats.totalHighlights}</span>
        <span className="text-[#8A8680]">highlights</span>
      </div>
      <div className="flex flex-col text-center">
        <span className="text-[#F0EDE6] font-medium">{data.stats.booksContributedTo}</span>
        <span className="text-[#8A8680]">books</span>
      </div>
      <div className="flex flex-col text-center">
        <span className="text-[#F0EDE6] font-medium">{data.stats.totalUpvotesReceived}</span>
        <span className="text-[#8A8680]">upvotes</span>
      </div>
    </div>
  );
}
