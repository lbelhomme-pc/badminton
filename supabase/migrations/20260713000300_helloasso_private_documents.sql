-- Boutique volants HelloAsso et documents privés CFVV.

alter table public.volants add column if not exists reference text;
alter table public.volants add column if not exists quantite_boite integer;
alter table public.volants add column if not exists photo_url text;
alter table public.volants add column if not exists disponibilite text;
alter table public.volants add column if not exists limite_commande integer;
alter table public.volants add column if not exists instructions_retrait text;
alter table public.volants add column if not exists helloasso_url text;
alter table public.volants add column if not exists helloasso_item_id text;
alter table public.volants add column if not exists payment_provider text;

update public.volants set disponibilite = case when coalesce(stock, 0) > 0 then 'disponible' else 'indisponible' end where disponibilite is null;
update public.volants set quantite_boite = 1 where quantite_boite is null;
update public.volants set limite_commande = 4 where limite_commande is null;
update public.volants set payment_provider = 'helloasso' where payment_provider is null;

alter table public.volants alter column quantite_boite set default 1;
alter table public.volants alter column limite_commande set default 4;
alter table public.volants alter column disponibilite set default 'disponible';
alter table public.volants alter column payment_provider set default 'helloasso';

alter table public.volants drop constraint if exists volants_quantite_boite_check;
alter table public.volants add constraint volants_quantite_boite_check check (quantite_boite is null or quantite_boite > 0);

alter table public.volants drop constraint if exists volants_limite_commande_check;
alter table public.volants add constraint volants_limite_commande_check check (limite_commande is null or limite_commande > 0);

alter table public.volants drop constraint if exists volants_disponibilite_check;
alter table public.volants add constraint volants_disponibilite_check check (disponibilite in ('disponible', 'indisponible'));

alter table public.volants drop constraint if exists volants_payment_provider_check;
alter table public.volants add constraint volants_payment_provider_check check (payment_provider in ('helloasso'));

create index if not exists volants_reference_idx on public.volants(reference);
create index if not exists volants_disponibilite_idx on public.volants(disponibilite);

create table if not exists public.documents_prives (
  id bigint generated always as identity primary key,
  titre text not null,
  description text,
  categorie text not null default 'autre',
  bucket_name text not null default 'cfvv-private-documents',
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  auteur text,
  version_label text,
  allowed_roles text[] not null default array['member']::text[],
  statut text not null default 'publie',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_prives_categorie_check check (categorie in ('saison', 'reglement', 'assemblee_generale', 'bureau', 'equipe', 'contact', 'formulaire', 'autre')),
  constraint documents_prives_statut_check check (statut in ('brouillon', 'publie', 'archive')),
  constraint documents_prives_size_check check (size_bytes > 0 and size_bytes <= 15728640),
  constraint documents_prives_mime_check check (mime_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ))
);

alter table public.documents_prives enable row level security;

create unique index if not exists documents_prives_file_path_idx on public.documents_prives(bucket_name, file_path);
create index if not exists documents_prives_categorie_idx on public.documents_prives(categorie);
create index if not exists documents_prives_statut_idx on public.documents_prives(statut);
create index if not exists documents_prives_allowed_roles_idx on public.documents_prives using gin(allowed_roles);

drop trigger if exists documents_prives_set_updated_at on public.documents_prives;
create trigger documents_prives_set_updated_at
before update on public.documents_prives
for each row execute function public.set_updated_at();

create or replace function public.can_access_private_document(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.statut = 'actif'
    )
    and (
      public.is_manager()
      or allowed_roles is null
      or cardinality(allowed_roles) = 0
      or 'member' = any(allowed_roles)
      or exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role::text = any(allowed_roles)
      )
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and (
            (p.role = 'admin' and (allowed_roles && array['admin', 'manager', 'member']))
            or (p.role in ('bureau', 'entraineur') and (allowed_roles && array['manager', 'member']))
            or (p.role = 'adherent' and 'member' = any(allowed_roles))
          )
      )
    );
$$;

revoke all on function public.can_access_private_document(text[]) from public;
grant execute on function public.can_access_private_document(text[]) to authenticated;

drop policy if exists "documents_prives_select_allowed" on public.documents_prives;
drop policy if exists "documents_prives_manager_all" on public.documents_prives;

create policy "documents_prives_select_allowed"
on public.documents_prives
for select
using (
  statut = 'publie'
  and public.can_access_private_document(allowed_roles)
);

create policy "documents_prives_manager_all"
on public.documents_prives
for all
using (public.is_manager())
with check (public.is_manager());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cfvv-private-documents',
  'cfvv-private-documents',
  false,
  15728640,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_private_documents_select_allowed" on storage.objects;
drop policy if exists "storage_private_documents_manager_insert" on storage.objects;
drop policy if exists "storage_private_documents_manager_update" on storage.objects;
drop policy if exists "storage_private_documents_manager_delete" on storage.objects;

create policy "storage_private_documents_select_allowed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cfvv-private-documents'
  and exists (
    select 1
    from public.documents_prives d
    where d.bucket_name = bucket_id
      and d.file_path = name
      and d.statut = 'publie'
      and public.can_access_private_document(d.allowed_roles)
  )
);

create policy "storage_private_documents_manager_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'cfvv-private-documents' and public.is_manager());

create policy "storage_private_documents_manager_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'cfvv-private-documents' and public.is_manager())
with check (bucket_id = 'cfvv-private-documents' and public.is_manager());

create policy "storage_private_documents_manager_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'cfvv-private-documents' and public.is_manager());
