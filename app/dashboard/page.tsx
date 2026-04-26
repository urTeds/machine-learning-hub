"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { ArticleFeed } from "@/components/articles/ArticleFeed";

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user profile — maybeSingle returns null (not an error) when no row exists
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(
        data ?? {
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? "",
        }
      );

      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Derive initials and first name from profile data
  const getInitials = (name: string, email: string): string => {
    if (name) {
      const parts = name.trim().split(" ");
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const getFirstName = (name: string): string => {
    if (!name) return "there";
    return name.trim().split(" ")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initials = getInitials(profile.full_name, profile.email);
  const firstName = getFirstName(profile.full_name);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <span className="text-white text-sm font-black">ML</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">
              Machine Learning Hub
            </span>
          </div>

          {/* User info + Sign Out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <span className="text-slate-300 text-sm font-medium max-w-[120px] truncate hidden sm:block">
                {profile.full_name || profile.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-400">Here&apos;s the latest in machine learning.</p>
        </div>

        <ArticleFeed userId={profile.id} />
      </main>
    </div>
  );
}
