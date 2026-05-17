-- Row Level Security pour le site du CFVV41.
-- A executer apres supabase/schema.sql.

create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = (select auth.uid())
        and ur.role::text = role_name
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and (
          p.role = role_name
          or (role_name = 'member' and p.role in ('adherent', 'entraineur', 'bureau', 'admin'))
          or (role_name = 'manager' and p.role in ('entraineur', 'bureau', 'admin'))
          or (role_name = 'admin' and p.role in ('bureau', 'admin'))
        )
    );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or public.has_role('super_admin');
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('manager') or public.is_admin();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('super_admin');
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

  if old.id = (select auth.uid())
    and old.role in ('bureau', 'admin')
    and new.role not in ('bureau', 'admin') then
    raise exception 'Impossible de retirer ses propres droits admin';
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
alter table public.user_roles enable row level security;
alter table public.creneaux enable row level security;
alter table public.reservations enable row level security;
alter table public.actualites enable row level security;
alter table public.volants enable row level security;
alter table public.commandes_volants enable row level security;
alter table public.rankings enable row level security;
alter table public.tarifs enable row level security;
alter table public.stock_movements enable row level security;
alter table public.settings_site enable row level security;
alter table public.audit_logs enable row level security;

-- Nettoyage pour permettre de reexecuter le fichier.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_safe" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
drop policy if exists "user_roles_admin_insert" on public.user_roles;
drop policy if exists "user_roles_admin_update" on public.user_roles;
drop policy if exists "user_roles_admin_delete" on public.user_roles;

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

drop policy if exists "tarifs_public_select_active" on public.tarifs;
drop policy if exists "tarifs_admin_all" on public.tarifs;

drop policy if exists "commandes_volants_insert_own" on public.commandes_volants;
drop policy if exists "commandes_volants_select_own_or_admin" on public.commandes_volants;
drop policy if exists "commandes_volants_admin_update" on public.commandes_volants;

drop policy if exists "stock_movements_manager_select" on public.stock_movements;
drop policy if exists "stock_movements_manager_insert" on public.stock_movements;

drop policy if exists "rankings_public_select_active" on public.rankings;
drop policy if exists "rankings_admin_all" on public.rankings;

drop policy if exists "settings_site_select_visible" on public.settings_site;
drop policy if exists "settings_site_admin_all" on public.settings_site;

drop policy if exists "audit_logs_admin_select" on public.audit_logs;
drop policy if exists "audit_logs_manager_insert" on public.audit_logs;

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

-- user_roles
create policy "user_roles_select_own_or_admin"
on public.user_roles
for select
using (user_id = (select auth.uid()) or public.is_admin());

create policy "user_roles_admin_insert"
on public.user_roles
for insert
with check (public.is_admin());

create policy "user_roles_admin_update"
on public.user_roles
for update
using (public.is_admin())
with check (public.is_admin());

create policy "user_roles_admin_delete"
on public.user_roles
for delete
using (public.is_admin());

-- creneaux
create policy "creneaux_public_select_active"
on public.creneaux
for select
using (actif = true or public.is_manager());

create policy "creneaux_admin_all"
on public.creneaux
for all
using (public.is_manager())
with check (public.is_manager());

-- reservations
create policy "reservations_insert_own"
on public.reservations
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reservations_select_own_or_admin"
on public.reservations
for select
using ((select auth.uid()) = user_id or public.is_manager());

create policy "reservations_update_own_cancel"
on public.reservations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and statut = 'annulee');

create policy "reservations_admin_update"
on public.reservations
for update
using (public.is_manager())
with check (public.is_manager());

-- actualites
create policy "actualites_select_public_or_member"
on public.actualites
for select
using (visible_public = true or auth.uid() is not null);

create policy "actualites_admin_all"
on public.actualites
for all
using (public.is_manager())
with check (public.is_manager());

-- volants
create policy "volants_select_active"
on public.volants
for select
using (actif = true or public.is_manager());

create policy "volants_admin_all"
on public.volants
for all
using (public.is_manager())
with check (public.is_manager());

-- tarifs
create policy "tarifs_public_select_active"
on public.tarifs
for select
using (actif = true or public.is_admin());

create policy "tarifs_admin_all"
on public.tarifs
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
using ((select auth.uid()) = user_id or public.is_manager());

create policy "commandes_volants_admin_update"
on public.commandes_volants
for update
using (public.is_manager())
with check (public.is_manager());

-- stock_movements
create policy "stock_movements_manager_select"
on public.stock_movements
for select
using (public.is_manager());

create policy "stock_movements_manager_insert"
on public.stock_movements
for insert
with check (public.is_manager());

-- rankings
create policy "rankings_public_select_active"
on public.rankings
for select
using (active = true and visibility = 'public');

create policy "rankings_admin_all"
on public.rankings
for all
using (public.is_manager())
with check (public.is_manager());

-- settings_site
create policy "settings_site_select_visible"
on public.settings_site
for select
using (
  visibility = 'public'
  or (visibility = 'internal' and (select auth.uid()) is not null)
  or public.is_admin()
);

create policy "settings_site_admin_all"
on public.settings_site
for all
using (public.is_admin())
with check (public.is_admin());

-- audit_logs
create policy "audit_logs_admin_select"
on public.audit_logs
for select
using (public.is_admin());

create policy "audit_logs_manager_insert"
on public.audit_logs
for insert
with check (public.is_manager() and (actor_id is null or actor_id = (select auth.uid())));
