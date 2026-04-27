"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AdminArticleForm } from "@/components/articles/AdminArticleForm";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { Article, Notification } from "@/lib/types";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"write" | "articles" | "activity">("write");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function fetchArticles(userId: string) {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", userId)
      .order("published_at", { ascending: false });

    if (data) setArticles(data as Article[]);
  }

  async function fetchActivity(userId: string) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .in("type", ["like", "comment"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) setRecentNotifications(data as Notification[]);
  }

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? "",
        },
        { onConflict: "id" }
      );

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData || profileData.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setProfile(profileData as Profile);
      await fetchArticles(user.id);
      await fetchActivity(user.id);
      setLoading(false);
    };

    init();
  }, [router]);

  const deleteArticle = async (id: string) => {
    setDeletingId(id);
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-slate-400 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ? profile.full_name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  const unreadActivity = recentNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <span className="text-white text-sm font-black">ML</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">
              Machine Learning Hub
            </span>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              User View
            </Link>

            <NotificationBell userId={profile.id} />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400">Manage articles and monitor user engagement.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Articles", value: articles.length, color: "text-blue-400" },
            {
              label: "Total Likes",
              value: articles.reduce((sum, a) => sum + ((a as unknown as { likes_count?: number }).likes_count ?? 0), 0),
              color: "text-red-400",
            },
            { label: "Activity", value: recentNotifications.length, color: "text-emerald-400" },
            { label: "Unread", value: unreadActivity, color: "text-yellow-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-4"
            >
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800/40 border border-slate-700 rounded-xl p-1 w-fit">
          {(["write", "articles", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "write" ? "Write Article" : tab === "articles" ? "My Articles" : "User Activity"}
            </button>
          ))}
        </div>

        {/* Tab: Write */}
        {activeTab === "write" && (
          <AdminArticleForm
            authorId={profile.id}
            onPublished={() => fetchArticles(profile.id)}
          />
        )}

        {/* Tab: My Articles */}
        {activeTab === "articles" && (
          <div className="space-y-3">
            {articles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-500 text-sm">No articles published yet.</p>
                <button
                  onClick={() => setActiveTab("write")}
                  className="mt-3 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Write your first article
                </button>
              </div>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-start gap-4"
                >
                  {/* Cover thumbnail */}
                  {article.cover_image ? (
                    <div
                      className="w-16 h-16 rounded-lg shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${article.cover_image})` }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg shrink-0 bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center">
                      <span className="text-lg font-black text-white/30">ML</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-slate-500 text-xs mb-2">
                      {formatDate(article.published_at)}
                    </p>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteArticle(article.id)}
                    disabled={deletingId === article.id}
                    aria-label={`Delete ${article.title}`}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors p-1.5 rounded-lg hover:bg-red-500/10 shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: User Activity */}
        {activeTab === "activity" && (
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-500 text-sm">No user activity yet.</p>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-slate-800/60 border rounded-xl p-4 flex items-start gap-3 ${
                    !n.read ? "border-blue-500/30" : "border-slate-700"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === "like" ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5 text-red-400" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-emerald-400" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm">{n.message}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(n.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" aria-hidden="true" />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
