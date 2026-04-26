-- likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text not null,
  created_at timestamptz default now(),
  unique(user_id, article_id)
);

-- comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Likes RLS policies
create policy "Anyone can read likes" on public.likes for select using (true);
create policy "Users can like articles" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike articles" on public.likes for delete using (auth.uid() = user_id);

-- Comments RLS policies
create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Users can add comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);
