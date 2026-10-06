-- Enkiama public journey content + anonymous composition bridge
-- Apply only after review in the target Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.journey_publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  subtitle text,
  summary text,
  why_it_worked text,
  hero_image text,
  status text not null default 'operated',
  period_label text,
  party_label text,
  duration_label text,
  route jsonb not null default '[]'::jsonb,
  match_profile jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journey_publication_chapters (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journey_publications(id) on delete cascade,
  position integer not null check (position > 0),
  day_label text,
  place text not null,
  title text not null,
  narrative text,
  image text,
  fact text,
  unique (journey_id, position)
);

create table if not exists public.journey_compositions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  preferences jsonb not null,
  suggested_route jsonb not null default '[]'::jsonb,
  example_slug text,
  source_path text not null default '/compose.html'
);

alter table public.journey_publications enable row level security;
alter table public.journey_publication_chapters enable row level security;
alter table public.journey_compositions enable row level security;

drop policy if exists "public can read published journeys" on public.journey_publications;
create policy "public can read published journeys"
on public.journey_publications for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published journey chapters" on public.journey_publication_chapters;
create policy "public can read published journey chapters"
on public.journey_publication_chapters for select
to anon, authenticated
using (
  exists (
    select 1 from public.journey_publications j
    where j.id = journey_id and j.published = true
  )
);

-- No direct anonymous INSERT policy on journey_compositions.
-- Anonymous writes go through a constrained RPC.

create or replace function public.get_public_journey_catalog()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'version', 1,
    'journeys', coalesce(jsonb_agg(
      jsonb_build_object(
        'slug', j.slug,
        'status', j.status,
        'featured', j.featured,
        'title', j.title,
        'subtitle', j.subtitle,
        'period_label', j.period_label,
        'party_label', j.party_label,
        'duration_label', j.duration_label,
        'hero_image', j.hero_image,
        'summary', j.summary,
        'why_it_worked', j.why_it_worked,
        'route', j.route,
        'match_profile', j.match_profile,
        'chapters', coalesce((
          select jsonb_agg(jsonb_build_object(
            'order', c.position,
            'day_label', c.day_label,
            'place', c.place,
            'title', c.title,
            'narrative', c.narrative,
            'image', c.image,
            'fact', c.fact
          ) order by c.position)
          from public.journey_publication_chapters c
          where c.journey_id = j.id
        ), '[]'::jsonb)
      )
      order by j.featured desc, j.sort_order asc, j.created_at desc
    ), '[]'::jsonb)
  )
  from public.journey_publications j
  where j.published = true;
$$;

revoke all on function public.get_public_journey_catalog() from public;
grant execute on function public.get_public_journey_catalog() to anon, authenticated;

create or replace function public.record_public_composition(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  prefs jsonb;
  route_data jsonb;
  ex_slug text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid payload';
  end if;

  if pg_column_size(p_payload) > 8192 then
    raise exception 'payload too large';
  end if;

  prefs := coalesce(p_payload->'preferences','{}'::jsonb);
  route_data := coalesce(p_payload->'route','[]'::jsonb);
  ex_slug := nullif(left(coalesce(p_payload->>'example_slug',''),120),'');

  if jsonb_typeof(prefs) <> 'object' or jsonb_typeof(route_data) <> 'array' then
    raise exception 'invalid composition shape';
  end if;

  insert into public.journey_compositions(preferences,suggested_route,example_slug,source_path)
  values (prefs,route_data,ex_slug,'/compose.html')
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.record_public_composition(jsonb) from public;
grant execute on function public.record_public_composition(jsonb) to anon, authenticated;

-- Recommended operational hardening before enabling capture:
-- 1. Add server-side rate limiting / Edge Function gateway.
-- 2. Retain no contact data in journey_compositions.
-- 3. Add a retention policy for anonymous composition events.
-- 4. Seed publication tables from data/journeys.json and verify images.
