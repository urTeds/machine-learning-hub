"use client";

import { useEffect, useState, type ReactElement } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";
import { CommentModal } from "./CommentModal";
import { ArticleReadModal } from "./ArticleReadModal";

interface ArticleCardProps {
  article: Article;
  userId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export function ArticleCard({ article, userId }: ArticleCardProps): ReactElement {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showRead, setShowRead] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      const [likesRes, userLikeRes, commentsRes] = await Promise.all([
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("article_id", article.id),
        supabase
          .from("likes")
          .select("id")
          .eq("article_id", article.id)
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("article_id", article.id),
      ]);

      setLikeCount(likesRes.count ?? 0);
      setLiked(userLikeRes.data !== null);
      setCommentCount(commentsRes.count ?? 0);
    };

    fetchCounts();
  }, [article.id, userId]);

  const toggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .match({ user_id: userId, article_id: article.id });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: userId, article_id: article.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }

    setIsLiking(false);
  };

  const authorName = article.profiles?.full_name || "Admin";
  const displayTags = article.tags.slice(0, 3);
  const readingTime = estimateReadingTime(article.content);

  return (
    <>
      <article className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all flex flex-col">
        {/* Cover image */}
        {article.cover_image ? (
          <div
            className="h-44 w-full shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${article.cover_image})` }}
            role="img"
            aria-label={`Cover image for ${article.title}`}
          />
        ) : (
          <div className="h-44 w-full shrink-0 bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center">
            <span className="text-4xl font-black text-white/20 select-none">ML</span>
          </div>
        )}

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4">
          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>

          {/* Content preview */}
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
            {article.content}
          </p>

          {/* Author row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <p className="text-slate-500 text-xs truncate">
              <span className="text-slate-400 font-medium">{authorName}</span>
              {" · "}
              {formatDate(article.published_at)}
              {" · "}
              {readingTime} min read
            </p>
          </div>

          {/* Action bar */}
          <div className="mt-auto pt-4 border-t border-slate-700/60 flex items-center gap-3">
            {/* Like */}
            <button
              onClick={toggleLike}
              disabled={isLiking}
              aria-label={liked ? "Unlike article" : "Like article"}
              aria-pressed={liked}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                liked ? "text-red-400" : "text-slate-400 hover:text-red-400"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {likeCount}
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments(true)}
              aria-label={`View comments for ${article.title}`}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {commentCount}
            </button>

            {/* Read full article */}
            <button
              onClick={() => setShowRead(true)}
              aria-label={`Read ${article.title}`}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Read
            </button>
          </div>
        </div>
      </article>

      <CommentModal
        articleId={article.id}
        articleTitle={article.title}
        userId={userId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />

      <ArticleReadModal
        article={article}
        isOpen={showRead}
        onClose={() => setShowRead(false)}
      />
    </>
  );
}
