-- ============================================================
-- 002_admin_articles.sql
-- Admin-posted articles, role-based profiles, and notifications
-- ============================================================

-- Profiles table (create if not exists, preserves existing data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Articles table (admin-posted)
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  cover_image text,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Drop old likes / comments (article_id was text for dev.to IDs)
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.comments;

-- Likes (UUID FK to articles)
CREATE TABLE public.likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Comments (UUID FK to articles)
CREATE TABLE public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('new_article', 'like', 'comment')),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  read bool NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: publicly readable (needed for author name in articles)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Articles: anyone can read; only admins can write
DROP POLICY IF EXISTS "Anyone can read articles" ON public.articles;
CREATE POLICY "Anyone can read articles" ON public.articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin can insert articles" ON public.articles;
CREATE POLICY "Admin can insert articles" ON public.articles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Admin can update articles" ON public.articles;
CREATE POLICY "Admin can update articles" ON public.articles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Admin can delete articles" ON public.articles;
CREATE POLICY "Admin can delete articles" ON public.articles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Likes
DROP POLICY IF EXISTS "Anyone can read likes" ON public.likes;
CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like articles" ON public.likes;
CREATE POLICY "Users can like articles" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike articles" ON public.likes;
CREATE POLICY "Users can unlike articles" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can add comments" ON public.comments;
CREATE POLICY "Users can add comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Notifications: users read/update their own; system inserts via triggers (SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;
CREATE POLICY "Users can mark own notifications read" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- ============================================================
-- Trigger: notify all users when admin publishes an article
-- ============================================================
CREATE OR REPLACE FUNCTION notify_users_new_article()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, article_id, actor_id, message)
  SELECT p.id, 'new_article', NEW.id, NEW.author_id,
    'New article: ' || NEW.title
  FROM public.profiles p
  WHERE p.role = 'user';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_published ON public.articles;
CREATE TRIGGER on_article_published
  AFTER INSERT ON public.articles
  FOR EACH ROW EXECUTE FUNCTION notify_users_new_article();

-- ============================================================
-- Trigger: notify article author (admin) when a user likes
-- ============================================================
CREATE OR REPLACE FUNCTION notify_admin_on_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, article_id, actor_id, message)
  SELECT a.author_id, 'like', NEW.article_id, NEW.user_id,
    'Someone liked your article'
  FROM public.articles a
  WHERE a.id = NEW.article_id
    AND a.author_id IS NOT NULL
    AND a.author_id != NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_liked ON public.likes;
CREATE TRIGGER on_article_liked
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_like();

-- ============================================================
-- Trigger: notify article author (admin) when a user comments
-- ============================================================
CREATE OR REPLACE FUNCTION notify_admin_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, article_id, actor_id, message)
  SELECT a.author_id, 'comment', NEW.article_id, NEW.user_id,
    'Someone commented on your article'
  FROM public.articles a
  WHERE a.id = NEW.article_id
    AND a.author_id IS NOT NULL
    AND a.author_id != NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_commented ON public.comments;
CREATE TRIGGER on_article_commented
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION notify_admin_on_comment();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
