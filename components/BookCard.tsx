"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Book as BookIcon, MoreVertical, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  category?: string | null;
  tags: string[];
  highlightCount: number;
}

export default function BookCard({
  id,
  title,
  author,
  coverImageUrl,
  category,
  tags,
  highlightCount,
}: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  return (
    <div className="group relative block h-full">
      <div className="flex flex-col h-full bg-surface border border-border rounded-card overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:border-primary/40 relative">
        {/* Cover Image — reduced from aspect-[2/3] to aspect-[4/3] */}
        <Link href={`/books/${id}`} className="block">
          <div className="w-full aspect-[4/3] relative bg-background flex items-center justify-center overflow-hidden border-b border-border/50">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt={`Cover of ${title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-border transition-transform duration-300 group-hover:scale-105 group-hover:text-primary/30">
                <BookIcon className="w-12 h-12 mb-2" strokeWidth={1} />
                <span className="text-xs tracking-widest uppercase font-semibold">No Cover</span>
              </div>
            )}
          </div>
        </Link>

        {/* Highlight Count Badge — top left */}
        {highlightCount > 0 && (
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-border text-xs font-semibold px-2 py-1 rounded-md text-primary shadow-sm">
            {highlightCount} {highlightCount === 1 ? "Highlight" : "Highlights"}
          </div>
        )}

        {/* Category Badge — top right (below menu) */}
        {category && (
          <div className="absolute top-3 right-12 bg-primary/10 backdrop-blur-md border border-primary/30 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full text-primary">
            {category === "fiction" ? "📖 Fiction" : "📚 Non-Fiction"}
          </div>
        )}

        {/* Three-dot menu — top right */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1 bg-background/60 backdrop-blur-md border border-border rounded-md text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-surface border border-border rounded-md shadow-xl z-20 overflow-hidden">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm("Delete this book and all its chapters and highlights?")) {
                    deleteMutation.mutate();
                  }
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
        <Link href={`/books/${id}`} className="block flex-1">
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-1 line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-text-muted mb-3 line-clamp-1">{author}</p>

            <div className="flex flex-wrap gap-1.5 mt-auto">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs border border-primary/30 text-primary/70 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs border border-primary/30 text-primary/70 rounded-full">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
