"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type HighlightType = "QUOTE" | "NOTE" | "TAKEAWAY";

interface AddHighlightFormProps {
  chapterId: string;
  bookId: string;
  onCancel: () => void;
}

const TYPE_CONFIG = {
  QUOTE: { label: "Quote", color: "#5C8FFF" },
  NOTE: { label: "Note", color: "#8A8680" },
  TAKEAWAY: { label: "Takeaway", color: "#E8C547" },
} as const;

export default function AddHighlightForm({ chapterId, bookId, onCancel }: AddHighlightFormProps) {
  const [content, setContent] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [type, setType] = useState<HighlightType>("QUOTE");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chapters/${chapterId}/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type, pageNumber: pageNumber.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add highlight");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", bookId] });
      setContent("");
      setPageNumber("");
      setType("QUOTE");
      onCancel();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-[10px] border border-border bg-surface overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a quote, note, or key takeaway…"
        autoFocus
        className="w-full bg-transparent px-4 pt-4 pb-2 text-text-primary placeholder-text-muted resize-none overflow-hidden min-h-[88px] text-sm focus:outline-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-2 border-t border-border">
        {/* Type toggle and Page Number */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(Object.entries(TYPE_CONFIG) as [HighlightType, { label: string; color: string }][]).map(
              ([key, { label, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className="px-3 py-1 text-xs font-semibold rounded-full border transition-all"
                  style={
                    type === key
                      ? { backgroundColor: color, borderColor: color, color: key === "NOTE" ? "#FFFFFF" : "#0F0F0F" }
                      : { backgroundColor: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="pageNumber" className="text-xs text-text-muted font-medium">Page No.</label>
            <input
              id="pageNumber"
              type="text"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="e.g. 42"
              className="w-16 bg-transparent border-b border-border text-text-primary text-xs focus:outline-none focus:border-primary px-1 py-0.5"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !content.trim()}
            className="px-4 py-1.5 bg-primary text-background text-xs font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {mutation.isPending ? "Adding…" : "Add Highlight"}
          </button>
        </div>
      </div>
    </form>
  );
}
