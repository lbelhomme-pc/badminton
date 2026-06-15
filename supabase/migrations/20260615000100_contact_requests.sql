-- Demandes de contact et seances d'essai CF2V41.
-- La creation est publique, la lecture et le suivi sont reserves aux responsables du club.

create table if not exists public.contact_requests (
  id bigint generated always as identity primary key,
  nom text not null,
  email text not null,
  telephone text,
  type_demande text not null,
  message text not null,
  statut text not null default 'nouveau',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_requests_statut_check check (statut in ('nouveau', 'en_cours', 'traite', 'archive')),
  constraint contact_requests_email_check check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint contact_requests_nom_length_check check (char_length(trim(nom)) >= 2),
  constraint contact_requests_message_length_check check (char_length(trim(message)) >= 5)
);

create index if not exists contact_requests_created_at_idx on public.contact_requests(created_at desc);
create index if not exists contact_requests_statut_idx on public.contact_requests(statut);
create index if not exists contact_requests_type_idx on public.contact_requests(type_demande);

drop trigger if exists contact_requests_set_updated_at on public.contact_requests;
create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row execute function public.set_updated_at();

alter table public.contact_requests enable row level security;

drop policy if exists "contact_requests_public_insert" on public.contact_requests;
drop policy if exists "contact_requests_manager_select" on public.contact_requests;
drop policy if exists "contact_requests_manager_update" on public.contact_requests;

create policy "contact_requests_public_insert"
on public.contact_requests
for insert
to anon, authenticated
with check (statut = 'nouveau');

create policy "contact_requests_manager_select"
on public.contact_requests
for select
to authenticated
using (public.is_manager());

create policy "contact_requests_manager_update"
on public.contact_requests
for update
to authenticated
using (public.is_manager())
with check (public.is_manager());

grant insert on public.contact_requests to anon, authenticated;
grant select, update on public.contact_requests to authenticated;
grant usage, select on sequence public.contact_requests_id_seq to anon, authenticated;
