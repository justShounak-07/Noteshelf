"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
}

export default function AddChapterModal({ isOpen, onClose, bookId }: AddChapterModalProps) {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/books/${bookId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create chapter");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", bookId] });
      setTitle("");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] w-full max-w-md rounded-[10px] shadow-2xl p-8 animate-in slide-in-from-bottom-4 fade-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A8680] hover:text-[#F0EDE6] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#F0EDE6] mb-6">
          Add Chapter
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="chapter-title" className="block text-sm font-medium text-[#8A8680] mb-2">
              Chapter Title
            </label>
            <input
              id="chapter-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Power of Habits"
              className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#5C8FFF] rounded-[6px] px-3 py-2.5 text-[#F0EDE6] placeholder-[#8A8680] focus:outline-none transition-colors text-sm"
            />
          </div>

          {mutation.isError && (
            <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8A8680] hover:text-[#F0EDE6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !title.trim()}
              className="px-6 py-2 bg-[#E8C547] text-[#0F0F0F] text-sm font-semibold rounded-[6px] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mutation.isPending ? "Adding…" : "Add Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
