import Image from "next/image";
import Link from "next/link";
import { Book as BookIcon } from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  tags: string[];
  highlightCount: number;
}

export default function BookCard({
  id,
  title,
  author,
  coverImageUrl,
  tags,
  highlightCount,
}: BookCardProps) {
  return (
    <Link href={`/books/${id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-surface border border-border rounded-card overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:border-primary/40 relative">
        {/* Cover Image */}
        <div className="w-full aspect-[2/3] relative bg-background flex items-center justify-center overflow-hidden border-b border-border/50">
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
              <BookIcon className="w-16 h-16 mb-4" strokeWidth={1} />
              <span className="text-xs tracking-widest uppercase font-semibold">No Cover</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-text-muted mb-4 line-clamp-1">{author}</p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs border border-primary/30 text-primary/70 rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs border border-primary/30 text-primary/70 rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Highlight Count Badge */}
        {highlightCount > 0 && (
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-border text-xs font-semibold px-2 py-1 rounded-md text-primary shadow-sm">
            {highlightCount} {highlightCount === 1 ? "Highlight" : "Highlights"}
          </div>
        )}
      </div>
    </Link>
  );
}
