-- Enkiama journey discovery architecture v1
-- Adds public journey discovery metadata without coupling it to media layout.

alter table public.journey_publications
  add column if not exists discovery_manifest jsonb not null default '{}'::jsonb;

comment on column public.journey_publications.discovery_manifest is
'Public discovery metadata for operated journeys. Expected keys: midpoint_note and chapters[]. Each chapter may expose href, label and context.';

create or replace function public.get_public_journey_catalog()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'version', 3,
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
        'hero_media', j.hero_media,
        'summary', j.summary,
        'why_it_worked', j.why_it_worked,
        'route', j.route,
        'match_profile', j.match_profile,
        'discovery_manifest', j.discovery_manifest,
        'chapters', coalesce((
          select jsonb_agg(jsonb_build_object(
            'order', c.position,
            'day_label', c.day_label,
            'place', c.place,
            'title', c.title,
            'narrative', c.narrative,
            'image', c.image,
            'layout', c.layout,
            'media', c.media,
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

-- Example discovery_manifest:
-- {
--   "midpoint_note": "After the Serengeti, the route moved away from the classic northern circuit.",
--   "chapters": [
--     {
--       "href": "serengeti.html",
--       "label": "Explore the Serengeti",
--       "context": "Why time, season and position inside the ecosystem matter."
--     }
--   ]
-- }
