-- Enkiama journey media architecture v2
-- Adds explicit art-direction metadata while preserving legacy image columns.

alter table public.journey_publications
  add column if not exists hero_media jsonb not null default '{}'::jsonb;

alter table public.journey_publication_chapters
  add column if not exists layout text not null default 'split',
  add column if not exists media jsonb not null default '{}'::jsonb;

alter table public.journey_publication_chapters
  drop constraint if exists journey_publication_chapters_layout_check;

alter table public.journey_publication_chapters
  add constraint journey_publication_chapters_layout_check
  check (layout in ('split','cinematic','photo-pair','quiet','panorama','human'));

comment on column public.journey_publications.hero_media is
'Public hero media contract. Expected keys include primary.src, alt, focal_point, caption and source_type.';

comment on column public.journey_publication_chapters.media is
'Chapter media contract. Expected keys: primary and optional secondary media objects with src, alt, focal_point, caption and source_type.';

comment on column public.journey_publication_chapters.layout is
'Editorial rendering hint. UI may gracefully fall back to split for unknown values.';

create or replace function public.get_public_journey_catalog()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'version', 2,
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

-- Media object example:
-- {
--   "primary": {
--     "src": "assets/images/serengeti.jpg",
--     "alt": "Open Serengeti plain in warm light",
--     "focal_point": "54% 46%",
--     "caption": "Two nights gave the group time inside the plain.",
--     "source_type": "owned"
--   },
--   "secondary": {
--     "src": "assets/images/night-sky.jpg",
--     "alt": "Night sky above camp",
--     "focal_point": "50% 50%",
--     "caption": "Evenings belong to the journey too.",
--     "source_type": "owned"
--   }
-- }

-- Provenance values are editorial metadata, not security controls.
-- Recommended vocabulary:
-- owned | guest-permission | commissioned | licensed | synthetic | existing-library | legacy
