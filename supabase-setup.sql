-- Run this in Supabase → SQL Editor → New query

-- 1. User profiles (stores Pro status)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  is_pro boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Daily usage tracking
create table usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  count integer default 0,
  unique(user_id, date)
);

-- 3. Saved translations
create table saved_translations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  mode text not null,
  original text not null,
  refined text,
  translated text,
  tone text,
  tone_count integer,
  from_lang text,
  to_lang text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Row Level Security (RLS) — users can only see their own data
alter table profiles enable row level security;
alter table usage enable row level security;
alter table saved_translations enable row level security;

create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users can manage own usage" on usage for all using (auth.uid() = user_id);
create policy "Users can manage own saves" on saved_translations for all using (auth.uid() = user_id);
