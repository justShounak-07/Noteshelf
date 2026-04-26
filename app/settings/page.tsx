"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import UserAvatar from "@/components/UserAvatar";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      // @ts-ignore
      setUsername(session.user.username || "");
    }
  }, [session]);

  const checkAvailability = useCallback(async (u: string) => {
    // @ts-ignore
    if (u === session?.user?.username) {
      setIsAvailable(null);
      return;
    }
    
    if (u.length < 3 || u.length > 20) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch(`/api/check-username?u=${encodeURIComponent(u)}`);
      const data = await res.json();
      setIsAvailable(data.available);
    } catch {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) checkAvailability(username);
    }, 400);
    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isAvailable === false) {
      setError("Please choose a valid and available username");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update settings");
      }

      await update({ name, username });
      setSuccess("Settings updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <div className="min-h-screen bg-background pt-20 px-4 text-center text-text-primary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 relative">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="w-full max-w-[480px] mx-auto bg-surface border-[0.5px] border-border rounded-xl p-8 relative z-10">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-8">Account settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[42px] bg-transparent border border-border rounded-md px-3 text-text-primary focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-text-muted font-medium select-none pointer-events-none">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsAvailable(null);
                }}
                // @ts-ignore
                className={`w-full h-[42px] bg-transparent border ${isAvailable === false ? "border-[#FF5C5C]" : "border-border"} rounded-md pl-8 pr-10 text-text-primary focus:border-[#5C8FFF] focus:outline-none transition-colors text-sm`}
              />
              <div className="absolute right-3">
                {isChecking && <div className="w-4 h-4 border-2 border-[#5C8FFF] border-t-transparent rounded-full animate-spin" />}
                {!isChecking && isAvailable === true && <Check className="w-4 h-4 text-[#4CAF50]" />}
                {!isChecking && isAvailable === false && <X className="w-4 h-4 text-[#FF5C5C]" />}
              </div>
            </div>
            {isAvailable === true && <p className="text-[#4CAF50] text-[12px] mt-1">Available</p>}
            {isAvailable === false && <p className="text-[#FF5C5C] text-[12px] mt-1">Taken or invalid</p>}
          </div>

          {error && <p className="text-[#FF5C5C] text-[13px]">{error}</p>}
          {success && <p className="text-[#4CAF50] text-[13px]">{success}</p>}

          <button
            type="submit"
            disabled={loading || isAvailable === false}
            className="w-full h-[42px] bg-primary text-[#0F0F0F] font-semibold rounded-md hover:brightness-105 transition-all focus:outline-none disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t-[0.5px] border-border">
          <h2 className="text-text-primary font-medium mb-4">Profile photo</h2>
          <div className="flex items-center gap-4">
            <UserAvatar size={64} user={session.user} />
            <p className="text-sm text-text-muted leading-relaxed">
              {session.user.image 
                ? "Your profile photo is currently synced from your connected account." 
                : "A custom monogram is generated based on your name."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
