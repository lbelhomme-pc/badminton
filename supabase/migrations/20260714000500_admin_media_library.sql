-- Mediatheque publique CFVV : images et fichiers publics avec metadonnees.

create table if not exists public.media_assets (
  id bigserial primary key,
  title text not null,
  description text,
  bucket_name text not null default 'cfvv-public-media',
  file_path text not null,
  file_name text not null,
  public_url text,
  mime_type text not null,
  size_bytes bigint not null,
  kind text not null,
  alt_text text,
  credit text,
  informative boolean not null default true,
  known_usage text[] not null default '{}'::text[],
  status text not null default 'active',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_kind_check check (kind in ('image', 'document')),
  constraint media_assets_status_check check (status in ('active', 'archived')),
  constraint media_assets_size_check check (size_bytes > 0 and size_bytes <= 8388608),
  constraint media_assets_alt_required_check check (kind <> 'image' or informative = false or nullif(trim(alt_text), '') is not null)
);

alter table public.media_assets add column if not exists title text;
alter table public.media_assets add column if not exists description text;
alter table public.media_assets add column if not exists bucket_name text;
alter table public.media_assets add column if not exists file_path text;
alter table public.media_assets add column if not exists file_name text;
alter table public.media_assets add column if not exists public_url text;
alter table public.media_assets add column if not exists mime_type text;
alter table public.media_assets add column if not exists size_bytes bigint;
alter table public.media_assets add column if not exists kind text;
alter table public.media_assets add column if not exists alt_text text;
alter table public.media_assets add column if not exists credit text;
alter table public.media_assets add column if not exists informative boolean;
alter table public.media_assets add column if not exists known_usage text[];
alter table public.media_assets add column if not exists status text;
alter table public.media_assets add column if not exists uploaded_by uuid references auth.users(id) on delete set null;
alter table public.media_assets add column if not exists created_at timestamptz;
alter table public.media_assets add column if not exists updated_at timestamptz;

update public.media_assets set bucket_name = 'cfvv-public-media' where bucket_name is null;
update public.media_assets set informative = true where informative is null;
update public.media_assets set known_usage = '{}'::text[] where known_usage is null;
update public.media_assets set status = 'active' where status is null;
update public.media_assets set created_at = now() where created_at is null;
update public.media_assets set updated_at = now() where updated_at is null;

create unique index if not exists media_assets_file_path_idx on public.media_assets(bucket_name, file_path);
create index if not exists media_assets_kind_idx on public.media_assets(kind);
create index if not exists media_assets_status_idx on public.media_assets(status);
create index if not exists media_assets_known_usage_idx on public.media_assets using gin(known_usage);

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_public_select_active" on public.media_assets;
create policy "media_assets_public_select_active"
on public.media_assets
for select
using (status = 'active');

drop policy if exists "media_assets_manager_all" on public.media_assets;
create policy "media_assets_manager_all"
on public.media_assets
for all
using (public.is_manager())
with check (public.is_manager());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cfvv-public-media',
  'cfvv-public-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_public_media_select" on storage.objects;
drop policy if exists "storage_public_media_manager_insert" on storage.objects;
drop policy if exists "storage_public_media_manager_update" on storage.objects;
drop policy if exists "storage_public_media_manager_delete" on storage.objects;

create policy "storage_public_media_select"
on storage.objects
for select
using (bucket_id = 'cfvv-public-media');

create policy "storage_public_media_manager_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'cfvv-public-media' and public.is_manager());

create policy "storage_public_media_manager_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'cfvv-public-media' and public.is_manager())
with check (bucket_id = 'cfvv-public-media' and public.is_manager());

create policy "storage_public_media_manager_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'cfvv-public-media' and public.is_manager());
