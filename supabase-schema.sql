-- Run this in the Supabase SQL editor to set up the database

create table if not exists workout_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_id text not null,
  workout_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer
);

create table if not exists session_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references workout_sessions(id) on delete cascade not null,
  exercise_id text not null,
  set_number integer not null,
  reps integer,
  weight_kg numeric(5,2),
  duration_seconds integer,
  completed_at timestamptz not null default now()
);

-- RLS
alter table workout_sessions enable row level security;
alter table session_sets enable row level security;

create policy "Users see own sessions"
  on workout_sessions for all
  using (auth.uid() = user_id);

create policy "Users see own sets"
  on session_sets for all
  using (
    session_id in (
      select id from workout_sessions where user_id = auth.uid()
    )
  );

-- Indexes
create index on workout_sessions(user_id, started_at desc);
create index on session_sets(session_id);
