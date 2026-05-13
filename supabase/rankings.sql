-- Migration ponctuelle pour ajouter la synchronisation des classements.
-- A executer si la base existe deja, apres schema.sql et rls.sql initiaux.

create table if not exists public.rankings (
  id bigint generated always as identity primary key,
  player_key text not null unique,
  display_name text not null,
  categorie text,
  classement_simple text,
  classement_double text,
  classement_mixte text,
  points_simple numeric(10,2),
  points_double numeric(10,2),
  points_mixte numeric(10,2),
  progression text,
  equipe text,
  visibility text not null default 'public',
  active boolean not null default true,
  source text not null default 'csv',
  sync_run_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rankings_visibility_check check (visibility in ('public', 'hidden'))
);

create index if not exists rankings_active_idx on public.rankings(active);
create index if not exists rankings_visibility_idx on public.rankings(visibility);
create index if not exists rankings_categorie_idx on public.rankings(categorie);
create index if not exists rankings_sync_run_idx on public.rankings(sync_run_id);

drop trigger if exists rankings_set_updated_at on public.rankings;
create trigger rankings_set_updated_at
before update on public.rankings
for each row execute function public.set_updated_at();

alter table public.rankings enable row level security;

drop policy if exists "rankings_public_select_active" on public.rankings;
drop policy if exists "rankings_admin_all" on public.rankings;

create policy "rankings_public_select_active"
on public.rankings
for select
using (active = true and visibility = 'public');

create policy "rankings_admin_all"
on public.rankings
for all
using (public.is_admin())
with check (public.is_admin());
