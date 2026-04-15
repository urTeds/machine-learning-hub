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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">ML</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! 👋</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* User Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : profile.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info Cards */}
            <div className="space-y-4 mb-8">
              {/* Name Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <p className="text-gray-600 text-sm font-medium mb-1">Full Name</p>
                <p className="text-gray-900 text-lg font-semibold">
                  {profile.full_name || "Not set"}
                </p>
              </div>

              {/* Email Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <p className="text-gray-600 text-sm font-medium mb-1">Email Address</p>
                <p className="text-gray-900 text-lg font-semibold break-all">{profile.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100 px-8 sm:px-10 py-4">
            <p className="text-xs text-gray-600 text-center">
              ✓ Securely authenticated with Supabase
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Enjoy exploring Machine Learning!
        </p>
      </div>
    </div>
  );
}
