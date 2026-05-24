-- Run this in the Supabase SQL editor (after supabase-schema.sql)
alter table session_sets add column if not exists target_reps integer;
