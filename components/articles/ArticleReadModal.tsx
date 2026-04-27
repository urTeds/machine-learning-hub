"use client";

import { useEffect, type ReactElement } from "react";
import type { Article } from "@/lib/types";

interface ArticleReadModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export function ArticleReadModal({ article, isOpen, onClose }: ArticleReadModalProps): ReactElement | null {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const authorName = article.profiles?.full_name || "Admin";
  const readingTime = estimateReadingTime(article.content);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="read-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-700/60 shrink-0">
          <div className="flex-1 min-w-0">
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h2
              id="read-modal-title"
              className="text-white font-bold text-lg leading-snug mb-2"
            >
              {article.title}
            </h2>
            <p className="text-slate-500 text-xs">
              By <span className="text-slate-400 font-medium">{authorName}</span>
              {" · "}
              {formatDate(article.published_at)}
              {" · "}
              {readingTime} min read
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close article"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Cover image */}
        {article.cover_image && (
          <div
            className="h-48 w-full shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.cover_image})` }}
            role="img"
            aria-label={`Cover image for ${article.title}`}
          />
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {article.content}
          </p>
        </div>
      </div>
    </div>
  );
}
