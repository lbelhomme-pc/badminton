-- Corbeille et restauration pour limiter les suppressions accidentelles.

alter table public.actualites add column if not exists statut text not null default 'publie';
alter table public.actualites add column if not exists archived_at timestamptz;
alter table public.actualites add column if not exists deleted_at timestamptz;

alter table public.events add column if not exists deleted_at timestamptz;

alter table public.documents_prives drop constraint if exists documents_prives_statut_check;
alter table public.documents_prives
add constraint documents_prives_statut_check check (statut in ('brouillon', 'publie', 'archive', 'corbeille'));

do $$
begin
  alter table public.actualites
  add constraint actualites_statut_check check (statut in ('brouillon', 'publie', 'archive', 'corbeille'));
exception
  when duplicate_object then null;
end;
$$;

create index if not exists actualites_statut_idx on public.actualites(statut);
create index if not exists actualites_deleted_at_idx on public.actualites(deleted_at);
create index if not exists events_deleted_at_idx on public.events(deleted_at);

drop policy if exists "actualites_select_public_or_member" on public.actualites;
drop policy if exists "actualites_admin_all" on public.actualites;
drop policy if exists "actualites_manager_insert" on public.actualites;
drop policy if exists "actualites_manager_update" on public.actualites;
drop policy if exists "actualites_admin_delete" on public.actualites;

create policy "actualites_select_public_or_member"
on public.actualites
for select
using (
  deleted_at is null
  and statut <> 'corbeille'
  and (
    (visible_public = true and statut = 'publie')
    or auth.uid() is not null
    or public.is_manager()
  )
);

create policy "actualites_manager_insert"
on public.actualites
for insert
with check (public.is_manager());

create policy "actualites_manager_update"
on public.actualites
for update
using (public.is_manager())
with check (public.is_manager());

create policy "actualites_admin_delete"
on public.actualites
for delete
using (public.is_admin());

drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_manager_all" on public.events;
drop policy if exists "events_manager_insert" on public.events;
drop policy if exists "events_manager_update" on public.events;
drop policy if exists "events_admin_delete" on public.events;

create policy "events_select_public"
on public.events
for select
using (
  deleted_at is null
  and visible_public = true
  and (
    (statut = 'published')
    or (statut = 'scheduled' and scheduled_for is not null and scheduled_for <= now())
    or statut = 'cancelled'
  )
);

create policy "events_manager_insert"
on public.events
for insert
with check (public.is_manager());

create policy "events_manager_update"
on public.events
for update
using (public.is_manager())
with check (public.is_manager());

create policy "events_admin_delete"
on public.events
for delete
using (public.is_admin());

drop policy if exists "documents_prives_select_allowed" on public.documents_prives;
drop policy if exists "documents_prives_manager_all" on public.documents_prives;
drop policy if exists "documents_prives_manager_insert" on public.documents_prives;
drop policy if exists "documents_prives_manager_update" on public.documents_prives;
drop policy if exists "documents_prives_admin_delete" on public.documents_prives;

create policy "documents_prives_select_allowed"
on public.documents_prives
for select
using (statut = 'publie' and public.can_access_private_document(allowed_roles));

create policy "documents_prives_manager_insert"
on public.documents_prives
for insert
with check (public.is_manager());

create policy "documents_prives_manager_update"
on public.documents_prives
for update
using (public.is_manager())
with check (public.is_manager());

create policy "documents_prives_admin_delete"
on public.documents_prives
for delete
using (public.is_admin());

drop policy if exists "storage_private_documents_manager_delete" on storage.objects;
create policy "storage_private_documents_manager_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'cfvv-private-documents' and public.is_admin());
