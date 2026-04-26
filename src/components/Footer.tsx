"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";

export default function Footer() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || message.length < 10) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          userEmail: session?.user?.email || null,
        }),
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <footer className="w-full bg-[#111111] border-t-[0.5px] border-[#2A2A2A] py-[2rem]">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          
          {/* COLUMN 1: Brand */}
          <div className="flex flex-col">
            <span className="font-heading text-[#E8C547] text-[18px]">NoteShelf</span>
            <p className="text-[#8A8680] text-[13px] mt-[6px] max-w-[200px] leading-[1.6]">
              One place for Every note of Books.
            </p>
          </div>

          {/* COLUMN 2: Connect */}
          <div className="flex flex-col">
            <h3 className="text-[#8A8680] text-[11px] uppercase tracking-[0.1em] mb-[12px]">
              Connect
            </h3>
            <div className="flex flex-col gap-2">
              <a 
                href="https://linkedin.com/in/shounak-pal-8b0859325/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-[8px] text-[#8A8680] hover:text-[#F0EDE6] transition-colors duration-150 text-[13px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                linkedin.com/in/shounak-pal-8b0859325/
              </a>
              <a 
                href="mailto:shounak.dev@gmail.com"
                className="flex items-center gap-[8px] text-[#8A8680] hover:text-[#F0EDE6] transition-colors duration-150 text-[13px]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                shounak.dev@gmail.com
              </a>
            </div>
          </div>

          {/* COLUMN 3: Feedback */}
          <div className="flex flex-col">
            <h3 className="text-[#8A8680] text-[11px] uppercase tracking-[0.1em] mb-[12px]">
              Feedback
            </h3>
            <p className="text-[#8A8680] text-[13px] mb-[12px] leading-[1.6]">
              Found a bug or have a suggestion?
            </p>
            
            {status === "success" ? (
              <div className="flex items-center gap-2 text-[#4CAF50] text-[13px] py-4">
                <Check className="w-4 h-4" />
                Thanks — feedback received.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full bg-[#1A1A1A] border-[0.5px] border-[#2A2A2A] rounded-[6px] p-[10px_12px] text-[#F0EDE6] placeholder:text-[#8A8680] text-[13px] focus:border-[#5C8FFF] focus:outline-none transition-colors duration-150 resize-none"
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={status === "loading" || message.length < 10}
                    className="bg-transparent border-[0.5px] border-[#2A2A2A] text-[#F0EDE6] rounded-[6px] px-[16px] py-[8px] text-[13px] cursor-pointer hover:border-[#E8C547] hover:text-[#E8C547] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending..." : "Send feedback"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-[#FF5C5C] text-[11px] mt-1 text-right">
                    Something went wrong. Try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t-[0.5px] border-[#2A2A2A] pt-[1.25rem] mt-[1.5rem]">
          <span className="text-[#8A8680] text-[12px]">
            © 2025 NoteShelf. Built by Shounak Pal
          </span>
          <span className="text-[#8A8680] text-[12px] italic mt-2 md:mt-0">
            Made for readers, Made by Reader
          </span>
        </div>
      </div>
    </footer>
  );
}
