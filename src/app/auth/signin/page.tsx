"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        // Shake effect is handled by CSS class condition
      } else {
        router.push("/books");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4">
      {/* SVG Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      <div 
        className={`w-full max-w-[400px] bg-surface border-[0.5px] border-border rounded-xl p-8 relative z-10 transition-all ${error ? "animate-shake" : ""}`}
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-primary mb-1">NoteShelf</h1>
          <p className="text-text-muted text-sm">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className={`w-full h-[42px] bg-transparent border ${error ? "border-[#FF5C5C]" : "border-border"} rounded-md px-3 text-text-primary placeholder-[#8A8680] focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm`}
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={`w-full h-[42px] bg-transparent border ${error ? "border-[#FF5C5C]" : "border-border"} rounded-md pl-3 pr-10 text-text-primary placeholder-[#8A8680] focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-[#FF5C5C] text-[13px] mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-[#E8C547] text-[#0F0F0F] font-semibold rounded-md mt-6 hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#E8C547] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-text-muted text-xs">or continue with</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/books" })}
            className="flex items-center justify-center gap-2 h-[42px] bg-surface border border-border rounded-md text-text-primary text-sm hover:bg-black/5 dark:bg-white/5 transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/books" })}
            className="flex items-center justify-center gap-2 h-[42px] bg-surface border border-border rounded-md text-text-primary text-sm hover:bg-black/5 dark:bg-white/5 transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/>
            </svg>
            Microsoft
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/register" className="text-[#5C8FFF] text-sm hover:underline">
            Don&apos;t have an account? Sign up &rarr;
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 300ms ease-in-out;
        }
      `}} />
    </div>
  );
}
