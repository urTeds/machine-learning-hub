"use client";

import { useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { DevToArticle } from "@/app/api/articles/route";
import { CommentModal } from "./CommentModal";

interface ArticleCardProps {
  article: DevToArticle;
  userId: string;
}

export function ArticleCard({ article, userId }: ArticleCardProps): ReactElement {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const articleId = article.id.toString();

  // Fetch initial like/comment state from Supabase
  useEffect(() => {
    const fetchCounts = async () => {
      const [likesRes, userLikeRes, commentsRes] = await Promise.all([
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("article_id", articleId),
        supabase
          .from("likes")
          .select("id")
          .eq("article_id", articleId)
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("article_id", articleId),
      ]);

      setLikeCount(likesRes.count ?? 0);
      setLiked(userLikeRes.data !== null);
      setCommentCount(commentsRes.count ?? 0);
    };

    fetchCounts();
  }, [articleId, userId]);

  const toggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .match({ user_id: userId, article_id: articleId });
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: userId, article_id: articleId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }

    setIsLiking(false);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const res = await fetch(`https://dev.to/api/articles/${article.id}`);
    const data: { body_markdown?: string } = await res.json();
    const markdown =
      data.body_markdown ??
      `# ${article.title}\n\n${article.description}\n\nSource: ${article.url}`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setIsDownloading(false);
  };

  const displayTags = article.tag_list.slice(0, 3);

  return (
    <>
      <article className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all flex flex-col">
        {/* Cover image */}
        {article.cover_image ? (
          <div className="relative h-44 w-full shrink-0">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          // Fallback gradient when no cover image is provided
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

          {/* Description */}
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
            {article.description}
          </p>

          {/* Author row */}
          <div className="flex items-center gap-2 mb-4">
            {article.user.profile_image ? (
              <Image
                src={article.user.profile_image}
                alt={article.user.name}
                width={20}
                height={20}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-600 shrink-0" />
            )}
            <p className="text-slate-500 text-xs truncate">
              <span className="text-slate-400 font-medium">{article.user.name}</span>
              {" · "}
              {article.readable_publish_date}
              {" · "}
              {article.reading_time_minutes} min read
            </p>
          </div>

          {/* Action bar */}
          <div className="mt-auto pt-4 border-t border-slate-700/60 flex items-center gap-3">
            {/* Like button */}
            <button
              onClick={toggleLike}
              disabled={isLiking}
              aria-label={liked ? "Unlike article" : "Like article"}
              aria-pressed={liked}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                liked
                  ? "text-red-400"
                  : "text-slate-400 hover:text-red-400"
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

            {/* Comment button */}
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

            {/* Read on Dev.to */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read ${article.title} on Dev.to`}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Read
            </a>

            {/* Download button — pushed to the right */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label={`Download ${article.title} as markdown`}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </article>

      <CommentModal
        articleId={articleId}
        articleTitle={article.title}
        userId={userId}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}
