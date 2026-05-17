-- Schema Supabase pour le site du CFVV41.
-- A executer dans l'editeur SQL Supabase avant rls.sql.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum ('member', 'manager', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end;
$$;
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  nom text,
  email text,
  telephone text,
  role text not null default 'adherent',
  statut text not null default 'actif',
  categorie text,
  date_naissance date,
  licence_ffbad text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('adherent', 'entraineur', 'bureau', 'admin'))
);

alter table public.profiles add column if not exists prenom text;
alter table public.profiles add column if not exists nom text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists telephone text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists statut text;
alter table public.profiles add column if not exists categorie text;
alter table public.profiles add column if not exists date_naissance date;
alter table public.profiles add column if not exists licence_ffbad text;
alter table public.profiles add column if not exists created_at timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz;
update public.profiles set role = 'adherent' where role is null;
update public.profiles set statut = 'actif' where statut is null;
update public.profiles set created_at = now() where created_at is null;
update public.profiles set updated_at = now() where updated_at is null;
alter table public.profiles alter column role set default 'adherent';
alter table public.profiles alter column statut set default 'actif';
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column updated_at set default now();
alter table public.profiles alter column role set not null;
alter table public.profiles alter column statut set not null;
alter table public.profiles alter column created_at set not null;
alter table public.profiles alter column updated_at set not null;

do $$
begin
  alter table public.profiles
  add constraint profiles_role_check check (role in ('adherent', 'entraineur', 'bureau', 'admin'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.profiles
  add constraint profiles_statut_check check (statut in ('en_attente', 'actif', 'inactif', 'ancien'));
exception
  when duplicate_object then null;
end;
$$;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_statut_idx on public.profiles(statut);
create index if not exists profiles_email_idx on public.profiles(email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists user_roles_role_idx on public.user_roles(role);
create index if not exists user_roles_user_idx on public.user_roles(user_id);

create or replace function public.prevent_user_roles_self_lockout()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE'
    and old.user_id = (select auth.uid())
    and old.role in ('admin', 'super_admin')
    and not exists (
      select 1
      from public.user_roles
      where user_id = old.user_id
        and role in ('admin', 'super_admin')
        and role <> old.role
    ) then
    raise exception 'Impossible de retirer ses propres droits admin';
  end if;

  return old;
end;
$$;

drop trigger if exists user_roles_prevent_self_lockout on public.user_roles;
create trigger user_roles_prevent_self_lockout
before delete on public.user_roles
for each row execute function public.prevent_user_roles_self_lockout();

create or replace function public.sync_user_roles_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, created_by)
  values (new.id, 'member', null)
  on conflict (user_id, role) do nothing;

  if tg_op = 'UPDATE' and old.role is distinct from new.role then
    delete from public.user_roles
    where user_id = new.id
      and role in ('manager', 'admin');
  end if;

  if new.role in ('entraineur', 'bureau', 'admin') then
    insert into public.user_roles (user_id, role, created_by)
    values (new.id, 'manager', null)
    on conflict (user_id, role) do nothing;
  end if;

  if new.role in ('bureau', 'admin') then
    insert into public.user_roles (user_id, role, created_by)
    values (new.id, 'admin', null)
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_user_roles on public.profiles;
create trigger profiles_sync_user_roles
after insert or update of role on public.profiles
for each row execute function public.sync_user_roles_from_profile();

insert into public.user_roles (user_id, role)
select id, 'member'::public.app_role
from public.profiles
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'manager'::public.app_role
from public.profiles
where role in ('entraineur', 'bureau', 'admin')
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from public.profiles
where role in ('bureau', 'admin')
on conflict (user_id, role) do nothing;

create or replace function public.set_user_roles(target_user_id uuid, target_roles public.app_role[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_roles public.app_role[];
  legacy_role text;
begin
  if not public.is_admin() then
    raise exception 'Acces reserve aux administrateurs';
  end if;

  if target_user_id = (select auth.uid()) then
    raise exception 'Impossible de modifier ses propres roles';
  end if;

  normalized_roles := coalesce(target_roles, array[]::public.app_role[]);

  if 'super_admin'::public.app_role = any(normalized_roles) then
    normalized_roles := normalized_roles || array['admin', 'manager', 'member']::public.app_role[];
  elsif 'admin'::public.app_role = any(normalized_roles) then
    normalized_roles := normalized_roles || array['manager', 'member']::public.app_role[];
  elsif 'manager'::public.app_role = any(normalized_roles) then
    normalized_roles := normalized_roles || array['member']::public.app_role[];
  end if;

  if not ('member'::public.app_role = any(normalized_roles)) then
    normalized_roles := normalized_roles || array['member']::public.app_role[];
  end if;

  select array_agg(distinct role_value order by role_value)
  into normalized_roles
  from unnest(normalized_roles) as role_value;

  delete from public.user_roles
  where user_id = target_user_id
    and not (role = any(normalized_roles));

  insert into public.user_roles (user_id, role, created_by)
  select target_user_id, role_value, (select auth.uid())
  from unnest(normalized_roles) as role_value
  on conflict (user_id, role) do nothing;

  legacy_role := case
    when 'admin'::public.app_role = any(normalized_roles) or 'super_admin'::public.app_role = any(normalized_roles) then 'admin'
    when 'manager'::public.app_role = any(normalized_roles) then 'bureau'
    else 'adherent'
  end;

  update public.profiles
  set role = legacy_role
  where id = target_user_id;

  insert into public.audit_logs (actor_id, action, table_name, row_id, metadata)
  values (
    (select auth.uid()),
    'user_roles.updated',
    'user_roles',
    target_user_id::text,
    jsonb_build_object('roles', normalized_roles)
  );
end;
$$;

revoke all on function public.set_user_roles(uuid, public.app_role[]) from public;
grant execute on function public.set_user_roles(uuid, public.app_role[]) to authenticated;

create table if not exists public.settings_site (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_site_visibility_check check (visibility in ('public', 'internal', 'admin'))
);

create index if not exists settings_site_visibility_idx on public.settings_site(visibility);

drop trigger if exists settings_site_set_updated_at on public.settings_site;
create trigger settings_site_set_updated_at
before update on public.settings_site
for each row execute function public.set_updated_at();

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text,
  row_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_table_row_idx on public.audit_logs(table_name, row_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

create table if not exists public.creneaux (
  id bigint generated always as identity primary key,
  jour text not null,
  heure_debut time not null,
  heure_fin time not null,
  gymnase text not null,
  adresse text,
  type text not null,
  public text not null,
  niveau text,
  places_max integer,
  responsable text,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creneaux_type_check check (type in ('jeu_libre', 'entrainement', 'competition', 'jeunes', 'adultes')),
  constraint creneaux_public_check check (public in ('jeunes', 'adultes', 'loisirs', 'competiteurs', 'tous')),
  constraint creneaux_places_check check (places_max is null or places_max > 0),
  constraint creneaux_heures_check check (heure_fin > heure_debut)
);

alter table public.creneaux add column if not exists adresse text;
alter table public.creneaux add column if not exists jour text;
alter table public.creneaux add column if not exists heure_debut time;
alter table public.creneaux add column if not exists heure_fin time;
alter table public.creneaux add column if not exists gymnase text;
alter table public.creneaux add column if not exists type text;
alter table public.creneaux add column if not exists public text;
alter table public.creneaux add column if not exists niveau text;
alter table public.creneaux add column if not exists places_max integer;
alter table public.creneaux add column if not exists responsable text;
alter table public.creneaux add column if not exists actif boolean;
alter table public.creneaux add column if not exists created_at timestamptz;
alter table public.creneaux add column if not exists updated_at timestamptz;
update public.creneaux set actif = true where actif is null;
update public.creneaux set type = 'jeu_libre' where type is null;
update public.creneaux set public = 'tous' where public is null;
update public.creneaux set jour = 'A renseigner' where jour is null;
update public.creneaux set heure_debut = '18:00'::time where heure_debut is null;
update public.creneaux set heure_fin = '20:00'::time where heure_fin is null;
update public.creneaux set gymnase = 'A renseigner' where gymnase is null;
update public.creneaux set created_at = now() where created_at is null;
update public.creneaux set updated_at = now() where updated_at is null;
alter table public.creneaux alter column actif set default true;
alter table public.creneaux alter column type set default 'jeu_libre';
alter table public.creneaux alter column public set default 'tous';
alter table public.creneaux alter column created_at set default now();
alter table public.creneaux alter column updated_at set default now();

create index if not exists creneaux_actif_idx on public.creneaux(actif);
create index if not exists creneaux_jour_idx on public.creneaux(jour);
create index if not exists creneaux_type_idx on public.creneaux(type);

drop trigger if exists creneaux_set_updated_at on public.creneaux;
create trigger creneaux_set_updated_at
before update on public.creneaux
for each row execute function public.set_updated_at();

create table if not exists public.reservations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  creneau_id bigint not null references public.creneaux(id) on delete cascade,
  date_reservation date not null,
  statut text not null default 'confirmee',
  commentaire text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_statut_check check (statut in ('en_attente', 'confirmee', 'annulee', 'refusee'))
);

alter table public.reservations add column if not exists statut text;
alter table public.reservations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.reservations add column if not exists creneau_id bigint references public.creneaux(id) on delete cascade;
alter table public.reservations add column if not exists date_reservation date;
alter table public.reservations add column if not exists commentaire text;
alter table public.reservations add column if not exists created_at timestamptz;
alter table public.reservations add column if not exists updated_at timestamptz;
update public.reservations set statut = 'confirmee' where statut is null;
update public.reservations set date_reservation = current_date where date_reservation is null;
update public.reservations set created_at = now() where created_at is null;
update public.reservations set updated_at = now() where updated_at is null;
alter table public.reservations alter column statut set default 'confirmee';
alter table public.reservations alter column created_at set default now();
alter table public.reservations alter column updated_at set default now();

create unique index if not exists reservations_unique_user_creneau_date_idx
on public.reservations(user_id, creneau_id, date_reservation);

create index if not exists reservations_user_idx on public.reservations(user_id);
create index if not exists reservations_creneau_idx on public.reservations(creneau_id);
create index if not exists reservations_date_idx on public.reservations(date_reservation);
create index if not exists reservations_statut_idx on public.reservations(statut);

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create table if not exists public.actualites (
  id bigint generated always as identity primary key,
  titre text not null,
  contenu text not null,
  image_url text,
  visible_public boolean not null default true,
  auteur_id uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.actualites add column if not exists image_url text;
alter table public.actualites add column if not exists titre text;
alter table public.actualites add column if not exists contenu text;
alter table public.actualites add column if not exists visible_public boolean;
alter table public.actualites add column if not exists auteur_id uuid references auth.users(id) on delete set null;
alter table public.actualites add column if not exists published_at timestamptz;
alter table public.actualites add column if not exists created_at timestamptz;
alter table public.actualites add column if not exists updated_at timestamptz;
update public.actualites set titre = 'Actualite' where titre is null;
update public.actualites set contenu = '' where contenu is null;
update public.actualites set visible_public = true where visible_public is null;
update public.actualites set published_at = now() where published_at is null;
update public.actualites set created_at = now() where created_at is null;
update public.actualites set updated_at = now() where updated_at is null;
alter table public.actualites alter column visible_public set default true;
alter table public.actualites alter column published_at set default now();
alter table public.actualites alter column created_at set default now();
alter table public.actualites alter column updated_at set default now();

create index if not exists actualites_visible_public_idx on public.actualites(visible_public);
create index if not exists actualites_published_at_idx on public.actualites(published_at desc);

drop trigger if exists actualites_set_updated_at on public.actualites;
create trigger actualites_set_updated_at
before update on public.actualites
for each row execute function public.set_updated_at();

create table if not exists public.volants (
  id bigint generated always as identity primary key,
  marque text not null,
  modele text,
  type text not null,
  prix numeric(10,2) not null,
  stock integer not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volants_type_check check (type in ('plastique', 'plume', 'hybride')),
  constraint volants_prix_check check (prix >= 0),
  constraint volants_stock_check check (stock >= 0)
);

alter table public.volants add column if not exists modele text;
alter table public.volants add column if not exists marque text;
alter table public.volants add column if not exists type text;
alter table public.volants add column if not exists prix numeric(10,2);
alter table public.volants add column if not exists stock integer;
alter table public.volants add column if not exists actif boolean;
alter table public.volants add column if not exists created_at timestamptz;
alter table public.volants add column if not exists updated_at timestamptz;
update public.volants set marque = 'A renseigner' where marque is null;
update public.volants set type = 'plume' where type is null;
update public.volants set prix = 0 where prix is null;
update public.volants set stock = 0 where stock is null;
update public.volants set actif = true where actif is null;
update public.volants set created_at = now() where created_at is null;
update public.volants set updated_at = now() where updated_at is null;
alter table public.volants alter column actif set default true;
alter table public.volants alter column created_at set default now();
alter table public.volants alter column updated_at set default now();

create index if not exists volants_actif_idx on public.volants(actif);
create index if not exists volants_type_idx on public.volants(type);

drop trigger if exists volants_set_updated_at on public.volants;
create trigger volants_set_updated_at
before update on public.volants
for each row execute function public.set_updated_at();

create table if not exists public.tarifs (
  id bigint generated always as identity primary key,
  titre text not null,
  description text,
  montant numeric(10,2) not null default 0,
  public text,
  ordre integer not null default 10,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tarifs_montant_check check (montant >= 0)
);

create index if not exists tarifs_actif_idx on public.tarifs(actif);
create index if not exists tarifs_ordre_idx on public.tarifs(ordre);

drop trigger if exists tarifs_set_updated_at on public.tarifs;
create trigger tarifs_set_updated_at
before update on public.tarifs
for each row execute function public.set_updated_at();

create table if not exists public.commandes_volants (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  volant_id bigint not null references public.volants(id) on delete restrict,
  quantite integer not null,
  statut text not null default 'demandee',
  total numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commandes_volants_quantite_check check (quantite > 0),
  constraint commandes_volants_statut_check check (statut in ('demandee', 'validee', 'payee', 'remise', 'annulee'))
);

alter table public.commandes_volants add column if not exists statut text;
alter table public.commandes_volants add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.commandes_volants add column if not exists volant_id bigint references public.volants(id) on delete restrict;
alter table public.commandes_volants add column if not exists quantite integer;
alter table public.commandes_volants add column if not exists total numeric(10,2);
alter table public.commandes_volants add column if not exists created_at timestamptz;
alter table public.commandes_volants add column if not exists updated_at timestamptz;
update public.commandes_volants set statut = 'demandee' where statut is null;
update public.commandes_volants set quantite = 1 where quantite is null;
update public.commandes_volants set created_at = now() where created_at is null;
update public.commandes_volants set updated_at = now() where updated_at is null;
alter table public.commandes_volants alter column statut set default 'demandee';
alter table public.commandes_volants alter column created_at set default now();
alter table public.commandes_volants alter column updated_at set default now();

create index if not exists commandes_volants_user_idx on public.commandes_volants(user_id);
create index if not exists commandes_volants_volant_idx on public.commandes_volants(volant_id);
create index if not exists commandes_volants_statut_idx on public.commandes_volants(statut);

drop trigger if exists commandes_volants_set_updated_at on public.commandes_volants;
create trigger commandes_volants_set_updated_at
before update on public.commandes_volants
for each row execute function public.set_updated_at();

create table if not exists public.stock_movements (
  id bigint generated always as identity primary key,
  volant_id bigint not null references public.volants(id) on delete cascade,
  commande_id bigint references public.commandes_volants(id) on delete set null,
  delta integer not null,
  stock_after integer,
  reason text not null default 'manual_adjustment',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint stock_movements_delta_check check (delta <> 0),
  constraint stock_movements_reason_check check (reason in ('order_created', 'order_cancelled', 'order_quantity_changed', 'manual_adjustment', 'initial_stock'))
);

create index if not exists stock_movements_volant_idx on public.stock_movements(volant_id);
create index if not exists stock_movements_commande_idx on public.stock_movements(commande_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements(created_at desc);

-- Stock automatique des volants :
-- - une commande non annulee retire la quantite du stock ;
-- - le passage en annulee remet la quantite en stock ;
-- - une modification de quantite ajuste l'ecart.
create or replace function public.sync_volant_stock_for_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  current_price numeric(10,2);
  old_active boolean;
  new_active boolean;
  delta integer;
begin
  if tg_op = 'INSERT' then
    if new.statut <> 'annulee' then
      select stock, prix
      into current_stock, current_price
      from public.volants
      where id = new.volant_id and actif = true
      for update;

      if current_stock is null then
        raise exception 'Volant indisponible';
      end if;

      if current_stock < new.quantite then
        raise exception 'Stock insuffisant pour cette commande';
      end if;

      update public.volants
      set stock = stock - new.quantite
      where id = new.volant_id
      returning stock into current_stock;

      insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
      values (new.volant_id, new.id, -new.quantite, current_stock, 'order_created', coalesce(auth.uid(), new.user_id));

      if new.total is null then
        new.total := current_price * new.quantite;
      end if;
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    old_active := old.statut <> 'annulee';
    new_active := new.statut <> 'annulee';
    delta := 0;

    if old_active and not new_active then
      delta := old.quantite;
    elsif not old_active and new_active then
      delta := -new.quantite;
    elsif old_active and new_active and old.quantite <> new.quantite then
      delta := old.quantite - new.quantite;
    end if;

    if delta < 0 then
      select stock
      into current_stock
      from public.volants
      where id = new.volant_id
      for update;

      if current_stock is null or current_stock < abs(delta) then
        raise exception 'Stock insuffisant pour cette commande';
      end if;
    end if;

    if delta <> 0 then
      update public.volants
      set stock = stock + delta
      where id = new.volant_id
      returning stock into current_stock;

      insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
      values (
        new.volant_id,
        new.id,
        delta,
        current_stock,
        case
          when old_active and not new_active then 'order_cancelled'
          else 'order_quantity_changed'
        end,
        coalesce(auth.uid(), new.user_id)
      );
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists commandes_volants_sync_stock_insert on public.commandes_volants;
create trigger commandes_volants_sync_stock_insert
before insert on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();

drop trigger if exists commandes_volants_sync_stock_update on public.commandes_volants;
create trigger commandes_volants_sync_stock_update
before update of statut, quantite on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();

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

-- Creation automatique d'un profil lors de l'inscription Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, prenom, nom, telephone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.raw_user_meta_data ->> 'telephone', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.settings_site (key, value, visibility)
values
  (
    'club',
    jsonb_build_object(
      'name', 'CFVV41',
      'full_name', 'Club des fous du Volant Vendomois',
      'city', 'Vendome',
      'ffbad_url', ''
    ),
    'public'
  ),
  (
    'contact',
    jsonb_build_object(
      'email', '',
      'phone', '',
      'facebook_url', '',
      'instagram_url', ''
    ),
    'public'
  )
on conflict (key) do nothing;

-- Donnees de demonstration publiques. Elles ne sont inserees que si la table est vide.
insert into public.creneaux (jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable)
select *
from (
  values
    ('Lundi', '19:00'::time, '21:00'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'loisirs', 'Adultes loisirs', 28, 'Bureau CFVV41'),
    ('Mercredi', '17:30'::time, '19:00'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeunes', 'jeunes', 'Jeunes debutants et confirmes', 20, 'Encadrants jeunes'),
    ('Jeudi', '20:00'::time, '22:00'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'competition', 'competiteurs', 'Adultes competiteurs', 24, 'Capitaine interclubs'),
    ('Samedi', '10:00'::time, '12:00'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'tous', 'Tous niveaux', 28, 'Bureau CFVV41')
) as seed(jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable)
where not exists (select 1 from public.creneaux);

insert into public.actualites (titre, contenu, visible_public)
select *
from (
  values
    ('Reprise des entrainements', 'Les creneaux de la saison sont ouverts. Consultez le planning avant de venir jouer.', true),
    ('Tournoi interne', 'Un tournoi interne convivial sera organise prochainement au gymnase.', true),
    ('Fermeture exceptionnelle du gymnase', 'Une fermeture ponctuelle peut modifier les creneaux. Consultez les actualites avant de vous deplacer.', true)
) as seed(titre, contenu, visible_public)
where not exists (select 1 from public.actualites);

insert into public.volants (marque, modele, type, prix, stock, actif)
select *
from (
  values
    ('RSL', 'Grade 3 Homologue FFBaD', 'plume', 19.00::numeric, 12, true),
    ('RSL', 'Training A9', 'plume', 15.00::numeric, 8, true)
) as seed(marque, modele, type, prix, stock, actif)
where not exists (select 1 from public.volants);

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select *
from (
  values
    ('Jeunes', 'Ecole de badminton, creneaux encadres et licence.', 0.00::numeric, 'Jeunes', 1, true),
    ('Adultes loisirs', 'Acces aux creneaux de jeu libre adultes.', 0.00::numeric, 'Adultes', 2, true),
    ('Competition', 'Licence adaptee aux tournois et interclubs.', 0.00::numeric, 'Competiteurs', 3, true),
    ('Essai', 'Jusqu''a 3 seances gratuites pour decouvrir.', 0.00::numeric, 'Decouverte', 4, true)
) as seed(titre, description, montant, public, ordre, actif)
where not exists (select 1 from public.tarifs);
