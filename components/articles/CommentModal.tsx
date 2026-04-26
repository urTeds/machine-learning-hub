"use client";

import { useEffect, useState, type ReactElement } from "react";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface CommentModalProps {
  articleId: string;
  articleTitle: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommentModal({
  articleId,
  articleTitle,
  userId,
  isOpen,
  onClose,
  onCommentAdded,
}: CommentModalProps): ReactElement | null {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data as Comment[]);
    }
    setIsLoading(false);
  };

  // Fetch comments whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, articleId]);

  // Escape key handler + body scroll lock
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      user_id: userId,
      article_id: articleId,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      await fetchComments();
      onCommentAdded();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comment-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-700">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
              Comments
            </p>
            <h2
              id="comment-modal-title"
              className="text-white font-bold text-sm line-clamp-1"
            >
              {articleTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700 shrink-0 mt-0.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Comment list */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5 text-slate-500 animate-spin"
                aria-label="Loading comments"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-slate-700/40 border border-slate-600/40 rounded-xl p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {/* Show shortened user id as anonymous handle since we don't store usernames here */}
                  <span className="text-slate-400 text-xs font-semibold">
                    {comment.user_id === userId ? "You" : "Member"}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer — comment input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-700 flex gap-3"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            aria-label="Write a comment"
            className="flex-1 bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            onKeyDown={(e) => {
              // Cmd/Ctrl + Enter submits
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
