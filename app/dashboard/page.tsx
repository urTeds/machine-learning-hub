"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

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

      // Fetch user profile
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Fallback to auth user data
        setProfile({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
        });
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <span className="text-white text-3xl font-black">ML</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Welcome! 👋</h1>
          <p className="text-slate-400">Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="p-8 sm:p-10">
            {/* User Avatar */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                {profile.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : profile.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info Cards */}
            <div className="space-y-4 mb-8">
              {/* Name Card */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-5 border border-slate-600 hover:border-blue-500/50 transition-colors">
                <p className="text-slate-400 text-xs font-semibold mb-2">FULL NAME</p>
                <p className="text-white text-xl font-bold">
                  {profile.full_name || "Not set"}
                </p>
              </div>

              {/* Email Card */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-5 border border-slate-600 hover:border-blue-500/50 transition-colors">
                <p className="text-slate-400 text-xs font-semibold mb-2">EMAIL ADDRESS</p>
                <p className="text-white text-lg font-bold break-all">{profile.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-700/50 border-t border-slate-600 px-8 sm:px-10 py-4">
            <p className="text-xs text-slate-400 text-center">
              ✓ Securely authenticated with Supabase
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Ready to explore more? 🚀
        </p>
      </div>
    </div>
  );
}
