-- ============================================================
-- 003_admin_engagement_notifications.sql
-- Ensure admins are notified when users like/comment their articles
-- ============================================================

-- Keep notification type constraint aligned with all supported events.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('new_article', 'like', 'comment'));

-- Notify the article author (admin) when another user likes their article.
CREATE OR REPLACE FUNCTION public.notify_admin_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, article_id, actor_id, message, read)
  SELECT
    a.author_id,
    'like',
    NEW.article_id,
    NEW.user_id,
    'New like on "' || COALESCE(a.title, 'your article') || '"',
    false
  FROM public.articles a
  WHERE a.id = NEW.article_id
    AND a.author_id IS NOT NULL
    AND a.author_id <> NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_liked ON public.likes;
CREATE TRIGGER on_article_liked
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_like();

-- Notify the article author (admin) when another user comments on their article.
CREATE OR REPLACE FUNCTION public.notify_admin_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, article_id, actor_id, message, read)
  SELECT
    a.author_id,
    'comment',
    NEW.article_id,
    NEW.user_id,
    'New comment on "' || COALESCE(a.title, 'your article') || '"',
    false
  FROM public.articles a
  WHERE a.id = NEW.article_id
    AND a.author_id IS NOT NULL
    AND a.author_id <> NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_article_commented ON public.comments;
CREATE TRIGGER on_article_commented
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_comment();
