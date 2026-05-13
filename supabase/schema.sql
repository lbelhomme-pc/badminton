-- Schema Supabase pour le site du CFVV41.
-- A executer dans l'editeur SQL Supabase avant rls.sql.

create extension if not exists "pgcrypto";

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
  categorie text,
  date_naissance date,
  licence_ffbad text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('adherent', 'entraineur', 'bureau', 'admin'))
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

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

create index if not exists volants_actif_idx on public.volants(actif);
create index if not exists volants_type_idx on public.volants(type);

drop trigger if exists volants_set_updated_at on public.volants;
create trigger volants_set_updated_at
before update on public.volants
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

create index if not exists commandes_volants_user_idx on public.commandes_volants(user_id);
create index if not exists commandes_volants_volant_idx on public.commandes_volants(volant_id);
create index if not exists commandes_volants_statut_idx on public.commandes_volants(statut);

drop trigger if exists commandes_volants_set_updated_at on public.commandes_volants;
create trigger commandes_volants_set_updated_at
before update on public.commandes_volants
for each row execute function public.set_updated_at();

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
      where id = new.volant_id;

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
      where id = new.volant_id;
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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
