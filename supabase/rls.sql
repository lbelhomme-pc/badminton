-- Row Level Security pour le site du CFVV41.
-- A executer apres supabase/schema.sql.

create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = role_name
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'bureau')
  );
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Modification du role interdite';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row
execute function public.prevent_profile_role_escalation();

alter table public.profiles enable row level security;
alter table public.creneaux enable row level security;
alter table public.reservations enable row level security;
alter table public.actualites enable row level security;
alter table public.volants enable row level security;
alter table public.commandes_volants enable row level security;
alter table public.rankings enable row level security;

-- Nettoyage pour permettre de reexecuter le fichier.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

drop policy if exists "creneaux_public_select_active" on public.creneaux;
drop policy if exists "creneaux_admin_all" on public.creneaux;

drop policy if exists "reservations_insert_own" on public.reservations;
drop policy if exists "reservations_select_own_or_admin" on public.reservations;
drop policy if exists "reservations_update_own_cancel" on public.reservations;
drop policy if exists "reservations_admin_update" on public.reservations;
drop policy if exists "reservations_admin_delete" on public.reservations;

drop policy if exists "actualites_select_public_or_member" on public.actualites;
drop policy if exists "actualites_admin_all" on public.actualites;

drop policy if exists "volants_select_active" on public.volants;
drop policy if exists "volants_admin_all" on public.volants;

drop policy if exists "commandes_volants_insert_own" on public.commandes_volants;
drop policy if exists "commandes_volants_select_own_or_admin" on public.commandes_volants;
drop policy if exists "commandes_volants_admin_update" on public.commandes_volants;

drop policy if exists "rankings_public_select_active" on public.rankings;
drop policy if exists "rankings_admin_all" on public.rankings;

-- profiles
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id and role = 'adherent');

-- Le trigger protect_profile_role interdit l'escalade de role par un non-admin.
create policy "profiles_update_own_safe"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_admin_update"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

-- creneaux
create policy "creneaux_public_select_active"
on public.creneaux
for select
using (actif = true or public.is_admin());

create policy "creneaux_admin_all"
on public.creneaux
for all
using (public.is_admin())
with check (public.is_admin());

-- reservations
create policy "reservations_insert_own"
on public.reservations
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reservations_select_own_or_admin"
on public.reservations
for select
using (auth.uid() = user_id or public.is_admin());

create policy "reservations_update_own_cancel"
on public.reservations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and statut = 'annulee');

create policy "reservations_admin_update"
on public.reservations
for update
using (public.is_admin())
with check (public.is_admin());

create policy "reservations_admin_delete"
on public.reservations
for delete
using (public.is_admin());

-- actualites
create policy "actualites_select_public_or_member"
on public.actualites
for select
using (visible_public = true or auth.uid() is not null);

create policy "actualites_admin_all"
on public.actualites
for all
using (public.is_admin())
with check (public.is_admin());

-- volants
create policy "volants_select_active"
on public.volants
for select
using (actif = true or public.is_admin());

create policy "volants_admin_all"
on public.volants
for all
using (public.is_admin())
with check (public.is_admin());

-- commandes_volants
create policy "commandes_volants_insert_own"
on public.commandes_volants
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "commandes_volants_select_own_or_admin"
on public.commandes_volants
for select
using (auth.uid() = user_id or public.is_admin());

create policy "commandes_volants_admin_update"
on public.commandes_volants
for update
using (public.is_admin())
with check (public.is_admin());

-- rankings
create policy "rankings_public_select_active"
on public.rankings
for select
using (active = true and visibility = 'public');

create policy "rankings_admin_all"
on public.rankings
for all
using (public.is_admin())
with check (public.is_admin());
