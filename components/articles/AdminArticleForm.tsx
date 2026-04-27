"use client";

import { useState, type ReactElement } from "react";
import { supabase } from "@/lib/supabase";

interface AdminArticleFormProps {
  authorId: string;
  onPublished: () => void;
}

const SUGGESTED_TAGS = ["machinelearning", "deeplearning", "ai", "nlp", "datascience", "python", "research"];

export function AdminArticleForm({ authorId, onPublished }: AdminArticleFormProps): ReactElement {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, "");
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: insertedArticle, error: insertError } = await supabase
        .from("articles")
        .insert({
          title: title.trim(),
          content: content.trim(),
          cover_image: coverImage.trim() || null,
          tags,
          author_id: authorId,
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message || "Failed to publish article");
      }

      if (insertedArticle?.id) {
        void fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "new_article",
            articleId: insertedArticle.id,
            actorId: authorId,
          }),
        }).catch(() => undefined);
      }

      setTitle("");
      setContent("");
      setCoverImage("");
      setTags([]);
      setTagInput("");
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
      onPublished();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish article");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-white font-bold text-base mb-1">Publish New Article</h2>
        <p className="text-slate-500 text-xs">All registered users will be notified when you publish.</p>
      </div>

      {/* Error / success */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-300 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Article published! Users have been notified.
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="article-title">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Transformer Architecture"
          required
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Cover image URL */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="article-cover">
          Cover Image URL <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          id="article-cover"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="article-tags">
          Tags <span className="text-slate-500 font-normal">(press Enter or comma to add)</span>
        </label>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="hover:text-blue-200 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          id="article-tags"
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => { if (tagInput) addTag(tagInput); }}
          placeholder="Add a tag..."
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />

        {/* Suggested tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addTag(t)}
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded-full px-2.5 py-0.5 transition-all"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-1.5" htmlFor="article-content">
          Content <span className="text-red-400">*</span>
        </label>
        <textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your article content here..."
          rows={10}
          required
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all leading-relaxed"
        />
        <p className="text-slate-600 text-xs mt-1">
          {content.split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          {isSubmitting ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 animate-spin" aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Publishing...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Publish Article
            </>
          )}
        </button>
      </div>
    </form>
  );
}
