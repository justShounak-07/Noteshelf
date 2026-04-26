"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to register");
        setLoading(false);
        return;
      }

      // Automatically sign in after registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Account created, but failed to log in automatically");
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
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4 py-12">
      {/* SVG Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      <div 
        className="w-full max-w-[400px] bg-surface border-[0.5px] border-border rounded-xl p-8 relative z-10 transition-all"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-xl font-bold text-text-primary mb-1">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full h-[42px] bg-transparent border border-border rounded-md px-3 text-text-primary placeholder-text-muted focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full h-[42px] bg-transparent border border-border rounded-md px-3 text-text-primary placeholder-text-muted focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm"
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full h-[42px] bg-transparent border border-border rounded-md px-3 text-text-primary placeholder-text-muted focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full h-[42px] bg-transparent border border-border rounded-md px-3 text-text-primary placeholder-text-muted focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm"
            />
          </div>

          {error && <p className="text-[#FF5C5C] text-[13px] mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] bg-[#E8C547] text-[#0F0F0F] font-semibold rounded-md mt-6 hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#E8C547] focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-xs">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/books" })}
            className="flex items-center justify-center gap-2 h-[42px] bg-transparent border border-border rounded-md text-text-primary text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
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
            type="button"
            onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/books" })}
            className="flex items-center justify-center gap-2 h-[42px] bg-transparent border border-border rounded-md text-text-primary text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/>
            </svg>
            Microsoft
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/signin" className="text-[#5C8FFF] text-sm hover:underline">
            Already have an account? Sign in &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
