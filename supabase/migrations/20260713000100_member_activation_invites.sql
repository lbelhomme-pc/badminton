-- Invitations personnelles pour activer un compte adhérent CFVV.
-- Le token envoyé par email ne doit jamais être stocké en clair : seule son empreinte est conservée.

create table if not exists public.member_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  licence_ffbad text,
  token_hash text not null unique,
  status text not null default 'pending',
  role text not null default 'adherent',
  roles public.app_role[] not null default array['member']::public.app_role[],
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  invited_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_invitations_status_check check (status in ('pending', 'used', 'expired', 'revoked')),
  constraint member_invitations_role_check check (role in ('adherent', 'entraineur', 'bureau', 'admin')),
  constraint member_invitations_email_check check (position('@' in email) > 1),
  constraint member_invitations_expiration_check check (expires_at > created_at)
);

alter table public.member_invitations add column if not exists email text;
alter table public.member_invitations add column if not exists licence_ffbad text;
alter table public.member_invitations add column if not exists token_hash text;
alter table public.member_invitations add column if not exists status text;
alter table public.member_invitations add column if not exists role text;
alter table public.member_invitations add column if not exists roles public.app_role[];
alter table public.member_invitations add column if not exists expires_at timestamptz;
alter table public.member_invitations add column if not exists used_at timestamptz;
alter table public.member_invitations add column if not exists used_by uuid references auth.users(id) on delete set null;
alter table public.member_invitations add column if not exists invited_by uuid references auth.users(id) on delete set null;
alter table public.member_invitations add column if not exists revoked_at timestamptz;
alter table public.member_invitations add column if not exists metadata jsonb;
alter table public.member_invitations add column if not exists created_at timestamptz;
alter table public.member_invitations add column if not exists updated_at timestamptz;

update public.member_invitations set status = 'pending' where status is null;
update public.member_invitations set role = 'adherent' where role is null;
update public.member_invitations set roles = array['member']::public.app_role[] where roles is null;
update public.member_invitations set metadata = '{}'::jsonb where metadata is null;
update public.member_invitations set created_at = now() where created_at is null;
update public.member_invitations set updated_at = now() where updated_at is null;

create unique index if not exists member_invitations_token_hash_idx on public.member_invitations(token_hash);
create index if not exists member_invitations_email_idx on public.member_invitations(lower(email));
create index if not exists member_invitations_status_idx on public.member_invitations(status);
create index if not exists member_invitations_expires_at_idx on public.member_invitations(expires_at);

drop trigger if exists member_invitations_set_updated_at on public.member_invitations;
create trigger member_invitations_set_updated_at
before update on public.member_invitations
for each row execute function public.set_updated_at();

alter table public.member_invitations enable row level security;

drop policy if exists "member_invitations_admin_select" on public.member_invitations;
create policy "member_invitations_admin_select"
on public.member_invitations
for select
using (public.is_admin());

drop policy if exists "member_invitations_admin_insert" on public.member_invitations;
create policy "member_invitations_admin_insert"
on public.member_invitations
for insert
with check (public.is_admin());

drop policy if exists "member_invitations_admin_update" on public.member_invitations;
create policy "member_invitations_admin_update"
on public.member_invitations
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "member_invitations_admin_delete" on public.member_invitations;
create policy "member_invitations_admin_delete"
on public.member_invitations
for delete
using (public.is_admin());

create or replace function public.mark_expired_member_invitations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer;
begin
  update public.member_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

revoke all on function public.mark_expired_member_invitations() from public;
grant execute on function public.mark_expired_member_invitations() to authenticated;
