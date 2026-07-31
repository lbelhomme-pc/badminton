-- Public partners confirmed by the club.
-- Keeps other existing partners and refreshes only SPORTEAM and Mairie de Vendome.

with desired(items) as (
  select jsonb_build_array(
    jsonb_build_object(
      'id', 'sporteam',
      'name', 'SPORTEAM',
      'description', 'Tous les adhérents du CFVV bénéficieront de prix attractifs sur l''ensemble de la gamme badminton.',
      'level', 'Partenaire équipement',
      'logo_url', '/partners/sporteam.png',
      'website_url', '',
      'alt_text', 'Logo SPORTEAM',
      'active', true
    ),
    jsonb_build_object(
      'id', 'mairie-vendome',
      'name', 'Mairie de Vendôme',
      'description', 'Le CFVV remercie le service des sports de la ville de Vendôme.',
      'level', 'Collectivité',
      'logo_url', '/partners/mairie-vendome.png',
      'website_url', '',
      'alt_text', 'Logo de la ville de Vendôme',
      'active', true
    ),
    jsonb_build_object(
      'id', 'codep41',
      'name', 'CODEP41',
      'description', 'Le CFVV remercie le Comité départemental de Badminton du Loir-et-Cher pour son accompagnement du badminton dans le département.',
      'level', 'Comité départemental',
      'logo_url', '/partners/codep41.png',
      'website_url', 'https://www.badminton41.org/',
      'alt_text', 'Logo du CODEP41, Comité départemental de Badminton du Loir-et-Cher',
      'active', true
    )
  )
),
existing(items) as (
  select coalesce(
    (select value -> 'items' from public.settings_site where key = 'partners'),
    '[]'::jsonb
  )
),
kept(items) as (
  select coalesce(
    jsonb_agg(item) filter (where item ->> 'id' not in ('sporteam', 'mairie-vendome', 'codep41')),
    '[]'::jsonb
  )
  from existing, jsonb_array_elements(existing.items) as item
),
merged(items) as (
  select kept.items || desired.items
  from kept, desired
)
insert into public.settings_site (key, value, visibility)
select 'partners', jsonb_build_object('items', merged.items), 'public'
from merged
on conflict (key) do update
set
  value = jsonb_set(
    coalesce(public.settings_site.value, '{}'::jsonb),
    '{items}',
    excluded.value -> 'items',
    true
  ),
  visibility = 'public',
  updated_at = now();
