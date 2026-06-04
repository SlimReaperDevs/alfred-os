-- Alfred OS — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  honorific text not null default 'Sir',
  display_name text not null default '',
  character_data jsonb not null default '{}',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  template_type text not null,
  name text not null,
  config jsonb not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  action_type text not null,
  metadata jsonb not null default '{}',
  xp_awarded integer not null default 0,
  logged_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key references public.users(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  notification_prefs jsonb not null default '{}',
  widget_layout jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  url text not null,
  notes text not null default '',
  source text not null default 'user',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.tracks enable row level security;
alter table public.activity_log enable row level security;
alter table public.settings enable row level security;
alter table public.resources enable row level security;

create policy "Users can manage own data" on public.users for all using (auth.uid() = id);
create policy "Users can manage own tracks" on public.tracks for all using (auth.uid() = user_id);
create policy "Users can manage own activity" on public.activity_log for all using (auth.uid() = user_id);
create policy "Users can manage own settings" on public.settings for all using (auth.uid() = user_id);
create policy "Users can manage own resources" on public.resources for all using (
  auth.uid() = (select user_id from public.tracks where id = track_id)
);
