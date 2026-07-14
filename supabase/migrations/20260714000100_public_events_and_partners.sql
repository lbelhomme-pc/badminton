create table if not exists public.events (
  id bigint generated always as identity primary key,
  slug text unique,
  titre text not null,
  description text not null default '',
  categorie text not null default 'club_event',
  statut text not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz,
  lieu text,
  public_cible text,
  image_url text,
  contact_label text,
  contact_href text,
  lien_url text,
  piece_jointe_url text,
  visible_public boolean not null default true,
  published_at timestamptz,
  scheduled_for timestamptz,
  cancellation_message text,
  recurrence_rule text,
  parent_event_id bigint references public.events(id) on delete set null,
  exception_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_categorie_check check (categorie in ('competition', 'club_event', 'meeting', 'camp', 'closure')),
  constraint events_statut_check check (statut in ('draft', 'published', 'scheduled', 'cancelled')),
  constraint events_dates_check check (ends_at is null or ends_at > starts_at)
);

create index if not exists events_public_starts_idx
on public.events(visible_public, starts_at);

create index if not exists events_statut_idx
on public.events(statut);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_manager_all" on public.events;

create policy "events_select_public"
on public.events
for select
using (
  visible_public = true
  and (
    statut in ('published', 'cancelled')
    or (statut = 'scheduled' and scheduled_for is not null and scheduled_for <= now())
  )
);

create policy "events_manager_all"
on public.events
for all
using (public.is_manager())
with check (public.is_manager());

insert into public.settings_site (key, value, visibility)
values ('partners', jsonb_build_object('items', jsonb_build_array()), 'public')
on conflict (key) do nothing;
