"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Library } from "lucide-react";
import BookCard from "@/components/BookCard";
import AddBookModal from "@/components/AddBookModal";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  tags: string[];
  highlightCount: number;
}

export default function BooksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch books
  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ["books", debouncedSearch, selectedTag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedTag) params.append("tag", selectedTag);
      const res = await fetch(`/api/books?${params.toString()}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (books && !selectedTag) {
      const tags = new Set<string>();
      books.forEach((b) => b.tags.forEach((t) => tags.add(t)));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableTags(Array.from(tags).sort());
    }
  }, [books, selectedTag]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-text-primary">Library</h1>
          <p className="text-text-muted mt-1">Discover and share the best highlights.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-[#0F0F0F] font-semibold px-6 py-2.5 rounded-input hover:brightness-110 transition-all flex-shrink-0"
        >
          Add a Book
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8680]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full bg-[#141414] border border-border focus:border-secondary rounded-input pl-10 pr-4 py-2.5 text-text-primary placeholder-[#8A8680] focus:outline-none transition-colors"
          />
        </div>

        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  tag === selectedTag
                    ? "bg-primary/15 border-primary text-primary"
                    : "border-primary/30 text-primary/70 hover:border-primary/60 bg-transparent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          Failed to load books.
        </div>
      ) : books?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface/30 rounded-2xl border border-border border-dashed">
          <Library className="w-16 h-16 text-text-muted mb-4 opacity-50" strokeWidth={1} />
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">No books found</h2>
          <p className="text-text-muted mb-6 max-w-md">
            {debouncedSearch || selectedTag
              ? "We couldn't find any books matching your current filters."
              : "Your library is currently empty. Be the first to add one!"}
          </p>
          {!debouncedSearch && !selectedTag && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-[#0F0F0F] font-semibold px-6 py-2 rounded-input hover:brightness-110 transition-all"
            >
              Add a Book
            </button>
          )}
          {(debouncedSearch || selectedTag) && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-[#0F0F0F] font-semibold px-6 py-2 rounded-input hover:brightness-110 transition-all"
              >
                Add a Book
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag(null);
                }}
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books?.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
