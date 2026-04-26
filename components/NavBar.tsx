import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BookOpen } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "./UserAvatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default async function NavBar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-40 w-full bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <BookOpen className="text-primary w-6 h-6" />
            <span className="font-heading text-2xl font-bold text-primary">NoteShelf</span>
          </Link>
          <Link href="/books" className="hidden sm:block text-sm font-medium text-text-muted hover:text-primary transition-colors">
            Library
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {session?.user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors focus:outline-none">
                  <span className="text-sm font-medium text-text-primary hidden sm:block">
                    {session.user.name && session.user.name.length > 14
                      ? session.user.name.slice(0, 14) + "..."
                      : session.user.name || "User"}
                  </span>
                  <UserAvatar size={32} user={session.user} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="min-w-[200px] bg-surface border border-border rounded-md shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <DropdownMenu.Item className="focus:outline-none cursor-pointer text-sm px-3 py-2 text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
                    {/* @ts-ignore */}
                    <Link href={`/profile/${session.user.username}`} className="block w-full">
                      View profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="focus:outline-none cursor-pointer text-sm px-3 py-2 text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
                    <Link href="/settings" className="block w-full">
                      Settings
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="focus:outline-none cursor-pointer text-sm px-3 py-2 text-text-primary hover:bg-red-500/10 hover:text-[#FF5C5C] rounded transition-colors">
                    <form action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}>
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </form>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold text-primary border border-primary/30 hover:border-primary/60 rounded-input transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-semibold text-background bg-primary hover:brightness-110 rounded-input transition-all shadow-[0_2px_10px_rgba(232,197,71,0.2)]"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
