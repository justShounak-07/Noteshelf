import Link from "next/link";
import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight tracking-tight">
          Every book. Every insight. <span className="text-primary block mt-2">One place.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Join NoteShelf to collaboratively document, discover, and discuss the best highlights from the books you love.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/books" 
            className="w-full sm:w-auto px-8 py-3 bg-primary text-background font-semibold rounded-input hover:bg-primary/90 transition-all transform hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(232,197,71,0.3)]"
          >
            Browse Books
          </Link>
        </div>
      </div>
      
      {/* Decorative gradient blur in background */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
}
