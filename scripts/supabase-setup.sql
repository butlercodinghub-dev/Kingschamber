-- ============================================
-- King's Chamber — Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Enable pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Wisdom units table (core data)
create table if not exists wisdom_units (
  id text primary key,
  text text not null,
  authors text[] not null default '{}',
  primary_author text not null,
  source_preview text not null default '',
  theme text not null default '',
  created_at timestamptz not null default now(),
  embedding vector(3072)
);

-- 3. No vector index needed — 3072 dims exceeds pgvector index limits,
--    but sequential scan is fast for ~3K rows

-- 4. Saved quotes table (replaces localStorage)
create table if not exists saved_quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  theme text not null default '',
  saved_at timestamptz not null default now()
);

-- 5. Vector similarity search function
create or replace function match_wisdom(
  query_embedding vector(3072),
  match_count int default 5,
  filter_authors text[] default null
)
returns table (
  id text,
  text text,
  authors text[],
  primary_author text,
  source_preview text,
  theme text,
  created_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    w.id,
    w.text,
    w.authors,
    w.primary_author,
    w.source_preview,
    w.theme,
    w.created_at,
    1 - (w.embedding <=> query_embedding) as similarity
  from wisdom_units w
  where
    w.embedding is not null
    and (filter_authors is null or w.authors && filter_authors)
  order by w.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 6. Function to get daily wisdom (deterministic by day)
create or replace function get_daily_wisdom()
returns table (
  quote text,
  author text,
  theme text
)
language plpgsql
as $$
declare
  day_index int;
  total int;
begin
  select count(*) into total from wisdom_units;
  if total = 0 then
    return query select
      'The Chamber is being prepared. Return when the wisdom has been gathered.'::text,
      'Council of Kings'::text,
      'patience'::text;
    return;
  end if;
  day_index := (extract(epoch from now())::bigint / 86400) % total;
  return query
    select w.text, w.primary_author, w.theme
    from wisdom_units w
    order by w.id
    offset day_index
    limit 1;
end;
$$;

-- 7. RLS policies (public read, insert for saved quotes)
alter table wisdom_units enable row level security;
alter table saved_quotes enable row level security;

create policy "Wisdom units are publicly readable"
  on wisdom_units for select
  using (true);

create policy "Saved quotes are publicly readable"
  on saved_quotes for select
  using (true);

create policy "Anyone can save quotes"
  on saved_quotes for insert
  with check (true);

create policy "Anyone can delete their quotes"
  on saved_quotes for delete
  using (true);
