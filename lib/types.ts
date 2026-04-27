export interface Article {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  author_id: string;
  published_at: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: "new_article" | "like" | "comment";
  article_id: string | null;
  actor_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
}
