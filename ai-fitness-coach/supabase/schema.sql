-- Supabase schema for the AI Fitness Coach project
-- Run inside the Supabase SQL editor or via the CLI after creating your project.

create extension if not exists "uuid-ossp";

-- Core user table mirroring auth.users for convenient joins
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- Detailed profile captured from the onboarding wizard
create table if not exists public.user_profile (
  user_id uuid primary key references public.users(id) on delete cascade,
  age int,
  gender text check (gender in ('male','female','non-binary','prefer_not_to_say')),
  height_cm numeric,
  weight_kg numeric,
  shoulder_width text,
  wrist_size text,
  injuries text,
  body_type text,
  short_term_goal text,
  long_term_goal text,
  target_physique text,
  training_days_per_week int,
  session_duration_minutes int,
  training_environment text,
  equipment text[],
  bench_kg numeric,
  squat_kg numeric,
  deadlift_kg numeric,
  press_kg numeric,
  sleep_hours numeric,
  stress_level text,
  steps_per_day int,
  avatar_metrics jsonb default '{}'::jsonb,
  last_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_plan (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  workout_date date not null,
  log_json jsonb not null,
  difficulty text,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  progress_date date not null,
  weight_kg numeric,
  strength_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.xp (
  user_id uuid primary key references public.users(id) on delete cascade,
  total_xp int not null default 0,
  level int not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.photo_metadata (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  hash text not null,
  taken_at date,
  notes text,
  created_at timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.users enable row level security;
alter table public.user_profile enable row level security;
alter table public.workout_plan enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress enable row level security;
alter table public.streaks enable row level security;
alter table public.xp enable row level security;
alter table public.photo_metadata enable row level security;

-- Users manage their own rows
create policy "users can manage self" on public.users
  for select using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "manage own profile" on public.user_profile
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own plan" on public.workout_plan
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own logs" on public.workout_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own progress" on public.progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own streaks" on public.streaks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own xp" on public.xp
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manage own photos" on public.photo_metadata
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for photos (run in the Storage section)
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "Users can upload their photos" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their photos" on storage.objects
  for select using (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their photos" on storage.objects
  for delete using (
    bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

comment on policy "Users can upload their photos" on storage.objects is 'Expect object key format: <user_id>/<filename>';
