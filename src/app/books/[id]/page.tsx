"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Book as BookIcon, ChevronLeft, Calendar, User as UserIcon, MessageSquare } from "lucide-react";
import ChapterList from "@/components/ChapterList";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

interface BookDetail {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  createdAt: string;
  createdBy: User | null;
  tags: string[];
  highlightCount: number;
  chapterCount: number;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data: book, isLoading, error } = useQuery<BookDetail>({
    queryKey: ["book", id],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Book not found</h2>
        <Link href="/books" className="text-primary hover:underline underline-offset-4">
          Return to Library
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(book.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Banner Header */}
      <div className="relative w-full overflow-hidden border-b border-border">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0">
          {book.coverImageUrl ? (
            <Image
              src={book.coverImageUrl}
              alt="Blurred background"
              fill
              className="object-cover blur-3xl opacity-30 scale-110"
              priority
            />
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F0F0F]" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 container max-w-6xl mx-auto px-4 pt-8 pb-12">
          <Link 
            href="/books" 
            className="inline-flex items-center text-sm text-text-muted hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Library
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Image */}
            <div className="w-48 md:w-64 shrink-0 shadow-2xl rounded-lg overflow-hidden border border-border/50 bg-surface aspect-[2/3] relative flex items-center justify-center">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 192px, 256px"
                />
              ) : (
                <div className="flex flex-col items-center text-border">
                  <BookIcon className="w-20 h-20 mb-4" strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 pt-2 md:pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs border border-primary/30 text-primary/80 rounded-full bg-primary/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-heading font-bold text-text-primary mb-2 tracking-tight">
                {book.title}
              </h1>
              <p className="text-xl md:text-2xl text-text-muted mb-6">
                by {book.author}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#8A8680] mt-auto border-t border-border/50 pt-6">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Added by <span className="text-text-primary">{book.createdBy?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {book.highlightCount} Highlights
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Highlights */}
      <div className="container max-w-6xl mx-auto px-4 py-12 flex-1">
        <ChapterList bookId={book.id} />
      </div>
    </div>
  );
}
