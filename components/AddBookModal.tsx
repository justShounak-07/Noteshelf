"use client";

import { useState, KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();

  const createBookMutation = useMutation({
    mutationFn: async (newBook: { title: string; author: string; coverImageUrl?: string; tags: string[] }) => {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });
      if (!res.ok) throw new Error("Failed to create book");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      onClose();
      // Reset form
      setTitle("");
      setAuthor("");
      setCoverImageUrl("");
      setTags([]);
      setTagInput("");
    },
  });

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    createBookMutation.mutate({ title, author, coverImageUrl, tags });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative bg-surface border border-border w-full max-w-md rounded-card shadow-2xl p-6 sm:p-8 transform transition-all animate-in slide-in-from-bottom-8 fade-in duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">Add a Book</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141414] border border-border rounded-input px-3 py-2 text-text-primary placeholder-[#8A8680] focus:outline-none focus:border-secondary transition-colors"
              placeholder="The Great Gatsby"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-text-muted mb-1">
              Author *
            </label>
            <input
              id="author"
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-[#141414] border border-border rounded-input px-3 py-2 text-text-primary placeholder-[#8A8680] focus:outline-none focus:border-secondary transition-colors"
              placeholder="F. Scott Fitzgerald"
            />
          </div>

          <div>
            <label htmlFor="cover" className="block text-sm font-medium text-text-muted mb-1">
              Cover Image URL
            </label>
            <input
              id="cover"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full bg-[#141414] border border-border rounded-input px-3 py-2 text-text-primary placeholder-[#8A8680] focus:outline-none focus:border-secondary transition-colors"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-text-muted mb-1">
              Tags (press Enter or comma to add)
            </label>
            <div className="w-full bg-[#141414] border border-border rounded-input p-2 flex flex-wrap gap-2 focus-within:border-secondary transition-colors">
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="flex items-center gap-1 bg-primary/15 text-primary border border-primary text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 min-w-[120px] bg-transparent text-text-primary placeholder-[#8A8680] focus:outline-none text-sm py-1"
                placeholder={tags.length === 0 ? "finance, habits..." : ""}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-muted hover:text-text-primary font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBookMutation.isPending || !title.trim() || !author.trim()}
              className="px-6 py-2 bg-primary text-background font-semibold rounded-input hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {createBookMutation.isPending ? "Adding..." : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
