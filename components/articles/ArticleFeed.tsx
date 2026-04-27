"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

interface ArticleFeedProps {
  userId: string;
}

const TAG_FILTERS: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Machine Learning", value: "machinelearning" },
  { label: "Deep Learning", value: "deeplearning" },
  { label: "AI", value: "ai" },
  { label: "NLP", value: "nlp" },
  { label: "Data Science", value: "datascience" },
];

const ITEMS_PER_PAGE = 6;

export function ArticleFeed({ userId }: ArticleFeedProps): ReactElement {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/articles");

    if (!res.ok) {
      setError("Failed to load articles. Please try again.");
      setIsLoading(false);
      return;
    }

    const json: { success: boolean; data?: Article[]; error?: string } = await res.json();

    if (!json.success || !json.data) {
      setError(json.error ?? "Something went wrong.");
      setIsLoading(false);
      return;
    }

    setArticles(json.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, query]);

  const filtered = articles.filter((a) => {
    const matchesTag =
      activeFilter === null ||
      a.tags.map((t) => t.toLowerCase()).includes(activeFilter);
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section aria-label="Latest Articles">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <h2 className="text-white font-bold text-lg">Latest Articles</h2>
            {!isLoading && !error && filtered.length > 0 && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/60 border border-slate-600/60 rounded-full px-2.5 py-0.5">
                {filtered.length}
              </span>
            )}
          </div>

          <div className="relative flex-1 max-w-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tag filters + pagination */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide flex-1">
            {TAG_FILTERS.map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.value)}
                  className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
                      currentPage === page
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/60 border border-slate-700 rounded-xl animate-pulse h-80"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg px-4 py-2 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Articles grid */}
      {!isLoading && !error && paginated.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((article) => (
            <ArticleCard key={article.id} article={article} userId={userId} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400 text-sm">
            {query
              ? `No results for "${query}".`
              : activeFilter
              ? "No articles found for this topic."
              : "No articles published yet. Check back soon."}
          </p>
          {(query || activeFilter) && (
            <button
              onClick={() => { setQuery(""); setActiveFilter(null); }}
              className="mt-3 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
