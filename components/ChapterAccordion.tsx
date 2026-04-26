"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Plus, TrendingUp, Clock } from "lucide-react";
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
    <div className="border-b border-[#2A2A2A] last:border-b-0">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group w-full flex items-center justify-between px-6 py-4 bg-[#161616] hover:bg-[#1A1A1A] transition-colors relative text-left"
      >
        {/* Gold left accent on hover / open */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#E8C547] transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />

        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-[#8A8680] flex-shrink-0">
            {String(order).padStart(2, "0")}
          </span>
          <h3 className="font-['Playfair_Display'] text-base font-bold text-[#F0EDE6] truncate">
            {title}
          </h3>
          {highlights.length > 0 && (
            <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F0F0F] border border-[#2A2A2A] text-[#8A8680]">
              {highlights.length}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#8A8680] flex-shrink-0 ml-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Accordion Body */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "9999px" : "0px" }}
      >
        <div className="bg-[#0F0F0F]">
          {/* Sort control — only show if there are multiple highlights */}
          {highlights.length > 1 && (
            <div className="flex items-center gap-1 px-6 py-3 border-b border-[#2A2A2A]">
              <span className="text-[10px] text-[#555] mr-2 uppercase tracking-widest">Sort</span>
              <div className="flex items-center bg-[#141414] rounded-[6px] p-0.5 gap-0.5">
                {(["top", "new"] as SortMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSort(mode)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                      sort === mode
                        ? "bg-[#2A2A2A] text-[#F0EDE6]"
                        : "text-[#8A8680] hover:text-[#F0EDE6]"
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
            <p className="px-6 py-6 text-sm text-[#8A8680] italic">
              No highlights yet — add the first one.
            </p>
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {sorted.map((h) => (
                <HighlightCard key={h.id} {...h} bookId={bookId} />
              ))}
            </div>
          )}

          {/* Add Highlight */}
          <div className="px-6 py-4 border-t border-[#2A2A2A]">
            {showForm ? (
              <AddHighlightForm
                chapterId={id}
                bookId={bookId}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-sm text-[#E8C547] hover:text-[#E8C547]/80 font-medium transition-colors"
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
