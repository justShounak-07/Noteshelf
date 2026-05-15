"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, BookOpen } from "lucide-react";
import ChapterAccordion from "./ChapterAccordion";
import AddChapterModal from "./AddChapterModal";

interface Highlight {
  id: string;
  content: string;
  type: "QUOTE" | "NOTE" | "TAKEAWAY";
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  } | null;
  upvoteCount: number;
  userUpvoted: boolean;
  isOwn: boolean;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  highlights: Highlight[];
}

interface ChapterListProps {
  bookId: string;
}

export default function ChapterList({ bookId }: ChapterListProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: chapters, isLoading, isError } = useQuery<Chapter[]>({
    queryKey: ["chapters", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/chapters`);
      if (!res.ok) throw new Error("Failed to fetch chapters");
      return res.json();
    },
  });

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-text-primary">
          Chapters &amp; Highlights
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:border-primary/50 text-primary text-sm font-semibold rounded-[6px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-[10px] border border-border overflow-hidden divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 bg-surface">
              <div className="flex items-center gap-3">
                <div className="h-3 w-6 bg-border rounded animate-pulse" />
                <div className="h-4 w-48 bg-border rounded animate-pulse" />
              </div>
              <div className="mt-4 space-y-2 pl-9">
                <div className="h-3 w-full bg-background rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-background rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-red-400 text-sm py-4">Failed to load chapters. Please refresh.</p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && chapters?.length === 0 && (
        <div className="rounded-[10px] border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-12 h-12 text-border mb-4" />
          <p className="text-text-muted mb-4">No chapters yet — add the first one</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-background text-sm font-semibold rounded-[6px] hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      )}

      {/* Chapter list */}
      {!isLoading && !isError && chapters && chapters.length > 0 && (
        <div className="rounded-[10px] border border-border overflow-hidden">
          {chapters.map((chapter) => (
            <ChapterAccordion
              key={chapter.id}
              id={chapter.id}
              title={chapter.title}
              order={chapter.order}
              bookId={bookId}
              highlights={chapter.highlights}
            />
          ))}
        </div>
      )}

      <AddChapterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookId={bookId}
      />
    </section>
  );
}
