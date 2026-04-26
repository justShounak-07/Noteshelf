"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronUp, Ghost } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { username } = useParams();
  const { data: session } = useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("not_found");
        throw new Error("Failed to load profile");
      }
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-20 px-4 text-center text-text-primary">Loading...</div>;
  }

  if (isError || !data?.user) {
    return (
      <div className="min-h-screen bg-background pt-32 px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">User not found</h1>
        <p className="text-text-muted">The profile you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/books" className="text-[#5C8FFF] mt-6 inline-block">Return to library &rarr;</Link>
      </div>
    );
  }

  const { user, stats, booksContributedTo, recentHighlights } = data;
  // @ts-ignore
  const isOwnProfile = session?.user?.username === user.username;

  return (
    <div className="min-h-screen bg-background pt-10 px-4 pb-20">
      <div className="max-w-[720px] mx-auto">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-surface border-[0.5px] border-border rounded-xl p-8 mb-12 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div 
                className="rounded-full shadow-[0_0_0_3px_#1A1A1A,0_0_0_5px_#E8C547]"
              >
                <UserAvatar size={80} user={user} />
              </div>
              <div className="flex flex-col ml-4">
                <h1 className="text-[22px] font-heading text-text-primary font-semibold tracking-wide">
                  {user.name}
                </h1>
                <p className="text-[14px] text-text-muted">@{user.username}</p>
                <p className="text-[13px] text-text-muted mt-1">
                  Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                </p>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col items-end gap-2">
                <span className="bg-primary/10 border border-primary/40 text-primary text-[12px] rounded-full px-3 py-1 font-medium">
                  Your profile
                </span>
                <Link href="/settings" className="text-[#5C8FFF] text-[14px] hover:underline pr-1">
                  Edit profile
                </Link>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-8 pt-6 border-t-[0.5px] border-border grid grid-cols-3 divide-x divide-[#2A2A2A]">
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-heading text-text-primary font-semibold">{stats.totalHighlights}</span>
              <span className="text-[12px] text-text-muted uppercase tracking-[0.08em] mt-1">Highlights</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-heading text-text-primary font-semibold">{stats.booksContributedTo}</span>
              <span className="text-[12px] text-text-muted uppercase tracking-[0.08em] mt-1">Books</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[28px] font-heading text-text-primary font-semibold">{stats.totalUpvotesReceived}</span>
              <span className="text-[12px] text-text-muted uppercase tracking-[0.08em] mt-1">Upvotes Received</span>
            </div>
          </div>
        </div>

        {/* BOOKS CONTRIBUTED TO SECTION */}
        <div className="mb-12">
          <h2 className="text-[16px] font-medium text-text-primary mb-3">Books contributed to</h2>
          {booksContributedTo.length > 0 ? (
            <div className="flex overflow-x-auto snap-x hide-scrollbar gap-4 pb-4">
              {booksContributedTo.map((book: any) => (
                <Link 
                  href={`/books/${book.id}`} 
                  key={book.id}
                  className="w-[140px] flex-shrink-0 snap-start group"
                >
                  <div className="relative w-[140px] h-[190px] rounded-lg overflow-hidden border border-transparent transition-transform duration-200 group-hover:-translate-y-[3px] group-hover:border-primary">
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center border border-border rounded-lg">
                        <span className="text-3xl opacity-50">📖</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary/15 backdrop-blur-md text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-md border border-primary/20">
                      {book.contributionCount} highlight{book.contributionCount !== 1 && 's'}
                    </div>
                  </div>
                  <h3 className="text-[13px] text-text-primary mt-2 line-clamp-2 leading-snug">{book.title}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted text-[14px] py-6 border border-dashed border-border rounded-xl">
              No books contributed to yet.
            </p>
          )}
        </div>

        {/* RECENT HIGHLIGHTS SECTION */}
        <div>
          <h2 className="text-[16px] font-medium text-text-primary mb-3">Recent highlights</h2>
          {recentHighlights.length > 0 ? (
            <div className="space-y-2">
              {recentHighlights.map((hl: any) => (
                <Link 
                  href={`/books/${hl.book.id}?chapter=${hl.chapter.id}`} 
                  key={hl.id}
                  className="block bg-surface border-[0.5px] border-border rounded-lg p-4 transition-colors hover:bg-black/5 dark:bg-white/5 group"
                  style={{
                    borderLeft: `3px solid ${hl.type === 'QUOTE' ? '#5C8FFF' : hl.type === 'NOTE' ? '#8A8680' : '#E8C547'}`
                  }}
                >
                  <p className="text-[14px] text-text-primary line-clamp-2 leading-relaxed mb-3">
                    {hl.content}
                    {hl.pageNumber && (
                      <span className="inline-block align-text-bottom text-[11px] text-text-muted border border-border rounded px-1.5 py-[1px] ml-2">
                        p.{hl.pageNumber}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]">
                      <span className="text-[#5C8FFF] group-hover:underline">
                        {hl.book.title}
                      </span>
                      <span className="text-text-muted"> · {hl.chapter.title}</span>
                    </span>
                    <div className="flex items-center gap-1 text-[12px] text-text-muted">
                      <ChevronUp className="w-3.5 h-3.5" />
                      {hl.upvoteCount}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-surface border border-dashed border-border rounded-xl text-center px-4">
              {isOwnProfile ? (
                <>
                  <Ghost className="w-12 h-12 text-text-muted opacity-30 mb-4" />
                  <p className="text-[16px] text-text-muted mb-2">Nothing here yet.</p>
                  <Link href="/books" className="text-[14px] text-[#5C8FFF] hover:underline">
                    Start by adding highlights to a book &rarr;
                  </Link>
                </>
              ) : (
                <p className="text-text-muted text-[15px]">This reader hasn&apos;t added any highlights yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
