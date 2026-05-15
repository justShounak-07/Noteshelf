"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Plus, TrendingUp, Clock, MoreVertical, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import HighlightCard, { type HighlightData } from "./HighlightCard";
import AddHighlightForm from "./AddHighlightForm";

type SortMode = "top" | "new";

interface ChapterAccordionProps {
  id: string;
  title: string;
  order: number;
  bookId: string;
  highlights: HighlightData[];
}

export default function ChapterAccordion({
  id,
  title,
  order,
  bookId,
  highlights,
}: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<SortMode>("top");
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  
  const queryClient = useQueryClient();

  const deleteChapterMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete chapter");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chapters", bookId] }),
  });

  const editChapterMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to edit chapter");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", bookId] });
      setIsEditingTitle(false);
    },
  });

  const sorted = useMemo(() => {
    const own = highlights.filter((h) => h.isOwn);
    const others = highlights.filter((h) => !h.isOwn);

    const sortedOthers = [...others].sort((a, b) => {
      if (sort === "top") {
        if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Own highlights always on top
    return [...own, ...sortedOthers];
  }, [highlights, sort]);

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        className="group w-full flex items-center justify-between px-6 py-4 bg-surface hover:brightness-110 transition-colors relative text-left cursor-pointer"
      >
        {/* Gold left accent on hover / open */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] bg-primary transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />

        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-text-muted flex-shrink-0">
            {String(order).padStart(2, "0")}
          </span>
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  editChapterMutation.mutate(editTitle);
                } else if (e.key === "Escape") {
                  setIsEditingTitle(false);
                  setEditTitle(title);
                }
              }}
              autoFocus
              className="bg-background border border-primary/30 text-text-primary px-2 py-1 rounded text-base font-['Playfair_Display'] font-bold focus:outline-none focus:border-primary/60 w-full min-w-[150px]"
              disabled={editChapterMutation.isPending}
            />
          ) : (
            <h3 className="font-['Playfair_Display'] text-base font-bold text-text-primary truncate">
              {title}
            </h3>
          )}
          {!isEditingTitle && highlights.length > 0 && (
            <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-background border border-border text-text-muted">
              {highlights.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Three-dot menu for chapter */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setChapterMenuOpen((v) => !v);
              }}
              className="p-1 text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {chapterMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-surface border border-border rounded-md shadow-xl z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                    setChapterMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-border transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this chapter and all its highlights?")) {
                      deleteChapterMutation.mutate();
                    }
                    setChapterMenuOpen(false);
                  }}
                  disabled={deleteChapterMutation.isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors border-t border-border"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteChapterMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Accordion Body */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "9999px" : "0px" }}
      >
        <div className="bg-background">
          {/* Sort control — only show if there are multiple highlights */}
          {highlights.length > 1 && (
            <div className="flex items-center gap-1 px-6 py-3 border-b border-border">
              <span className="text-[10px] text-text-muted mr-2 uppercase tracking-widest">Sort</span>
              <div className="flex items-center bg-surface rounded-[6px] p-0.5 gap-0.5">
                {(["top", "new"] as SortMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSort(mode)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                      sort === mode
                        ? "bg-border text-text-primary"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {mode === "top" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {mode === "top" ? "Top" : "New"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Highlights list */}
          {sorted.length === 0 ? (
            <p className="px-6 py-6 text-sm text-text-muted italic">
              No highlights yet — add the first one.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {sorted.map((h) => (
                <HighlightCard key={h.id} {...h} bookId={bookId} />
              ))}
            </div>
          )}

          {/* Add Highlight */}
          <div className="px-6 py-4 border-t border-border">
            {showForm ? (
              <AddHighlightForm
                chapterId={id}
                bookId={bookId}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Highlight
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
