import { NextResponse } from "next/server";

export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  published_at: string;
  readable_publish_date: string;
  tag_list: string[];
  cover_image: string | null;
  reading_time_minutes: number;
  url: string;
  user: {
    name: string;
    profile_image: string;
  };
  positive_reactions_count: number;
  comments_count: number;
}

export async function GET() {
  const tags = ["machinelearning", "deeplearning", "ai", "nlp", "datascience"];
  const opts = { next: { revalidate: 3600 } };

  const results = await Promise.allSettled(
    tags.map((tag) =>
      fetch(`https://dev.to/api/articles?tag=${tag}&per_page=20`, opts).then(
        (r) => (r.ok ? (r.json() as Promise<DevToArticle[]>) : []
      ))
    )
  );

  const seen = new Set<number>();
  const articles: DevToArticle[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const article of result.value) {
        if (!seen.has(article.id)) {
          seen.add(article.id);
          articles.push(article);
        }
      }
    }
  }

  articles.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  return NextResponse.json({ success: true, data: articles.slice(0, 30) });
}
