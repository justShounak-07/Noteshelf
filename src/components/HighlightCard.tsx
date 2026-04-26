"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2, ChevronUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserAvatar from "./UserAvatar";
import ContributorHoverCard from "./ContributorHoverCard";

type HighlightType = "QUOTE" | "NOTE" | "TAKEAWAY";

interface Contributor {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

export interface HighlightData {
  id: string;
  content: string;
  type: HighlightType;
  pageNumber?: string | null;
  createdAt: string;
  createdBy: Contributor | null;
  upvoteCount: number;
  userUpvoted: boolean;
  isOwn: boolean;
}

interface HighlightCardProps extends HighlightData {
  bookId: string;
}

const TYPE_CONFIG: Record<HighlightType, { label: string; color: string }> = {
  QUOTE: { label: "QUOTE", color: "#5C8FFF" },
  NOTE: { label: "NOTE", color: "#8A8680" },
  TAKEAWAY: { label: "TAKEAWAY", color: "#E8C547" },
};

export default function HighlightCard({
  id,
  content,
  type,
  pageNumber,
  createdAt,
  createdBy,
  upvoteCount,
  userUpvoted,
  isOwn,
  bookId,
}: HighlightCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [upvoteAnim, setUpvoteAnim] = useState(false);
  const queryClient = useQueryClient();
  const { color, label } = TYPE_CONFIG[type];

  // --- Delete ---
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/highlights/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chapters", bookId] }),
  });

  // --- Upvote (optimistic) ---
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/highlights/${id}/upvote`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to upvote");
      }
      return res.json() as Promise<{ upvoted: boolean; count: number }>;
    },
    onMutate: async () => {
      // Optimistically update cache
      await queryClient.cancelQueries({ queryKey: ["chapters", bookId] });
      const prev = queryClient.getQueryData(["chapters", bookId]);

      queryClient.setQueryData(["chapters", bookId], (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((ch: { highlights: HighlightData[] }) => ({
          ...ch,
          highlights: ch.highlights.map((h: HighlightData) =>
            h.id === id
              ? {
                  ...h,
                  userUpvoted: !userUpvoted,
                  upvoteCount: userUpvoted ? h.upvoteCount - 1 : h.upvoteCount + 1,
                }
              : h
          ),
        }));
      });

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back on failure
      if (ctx?.prev) queryClient.setQueryData(["chapters", bookId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", bookId] });
    },
  });

  const handleUpvote = useCallback(() => {
    setUpvoteAnim(true);
    setTimeout(() => setUpvoteAnim(false), 300);
    upvoteMutation.mutate();
  }, [upvoteMutation]);

  return (
    <div
      className="group relative px-6 py-5 bg-surface hover:bg-surface/80 transition-colors"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Own highlight badge */}
      {isOwn && (
        <span className="absolute top-4 left-6 text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          YOUR HIGHLIGHT
        </span>
      )}

      {/* Type badge */}
      <span
        className={`absolute ${isOwn ? "top-10" : "top-4"} right-4 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded`}
        style={{ color, border: `1px solid ${color}33` }}
      >
        {label}
      </span>

      {/* Three-dot delete menu */}
      <div className={`absolute ${isOwn ? "top-14" : "top-9"} right-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-28 bg-surface border border-border rounded-md shadow-xl z-20 overflow-hidden">
            <button
              onClick={() => {
                if (confirm("Delete this highlight?")) deleteMutation.mutate();
                setMenuOpen(false);
              }}
              disabled={deleteMutation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className={`whitespace-pre-wrap text-text-primary leading-relaxed text-sm pr-8 mb-5 ${isOwn ? "mt-6" : ""}`}>
        {content}
      </p>

      {/* Bottom row: contributor + upvote */}
      <div className="flex items-center justify-between">
        {/* Contributor */}
        <div className="flex items-center gap-2">
          {createdBy ? (
            <ContributorHoverCard user={createdBy}>
              <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                <UserAvatar size={24} user={createdBy} />
                <span className="text-xs text-text-muted">{createdBy.name ?? "Anonymous"}</span>
              </div>
            </ContributorHoverCard>
          ) : (
            <div className="flex items-center gap-2">
              <UserAvatar size={24} user={null} />
              <span className="text-xs text-text-muted">Anonymous</span>
            </div>
          )}
          
          <span className="text-[10px] text-text-muted opacity-60">·</span>
          <span className="text-[10px] text-text-muted opacity-80">
            {formatDistanceToNow(new Date(createdAt))} ago
          </span>
          {pageNumber && (
            <>
              <span className="text-[10px] text-text-muted opacity-60">·</span>
              <span className="text-[10px] font-medium text-text-muted">
                p. {pageNumber}
              </span>
            </>
          )}
        </div>

        {/* Upvote button */}
        <div className="relative group/upvote">
          <button
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all select-none cursor-pointer
              ${userUpvoted
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:text-text-primary"
              }
            `}
            style={userUpvoted ? { backgroundColor: "rgba(232,197,71,0.08)" } : {}}
          >
            <ChevronUp
              className="w-4 h-4 transition-transform"
              style={{
                color: userUpvoted ? "var(--primary)" : undefined,
                transform: upvoteAnim ? "scale(1.4)" : "scale(1)",
                transition: "transform 150ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
            <span style={{ color: userUpvoted ? "var(--primary)" : undefined }}>
              {upvoteCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
