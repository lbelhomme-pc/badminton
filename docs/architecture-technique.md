# Architecture technique

Stack cible :

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- RLS PostgreSQL
- Stripe compatible V2

Ce document precise l'architecture avant implementation. Il contient du SQL de conception pour cadrer la base, mais ne cree pas encore l'application.

## 1. Principes d'architecture

### Objectifs techniques

- Site rapide, mobile-first et SEO-friendly.
- Reservation fiable, transactionnelle, sans depassement de capacite.
- Authentification simple avec Supabase.
- RLS stricte sur toutes les donnees exposees.
- Separation claire public / adherent / admin.
- MVP sobre, extensible vers Stripe, emails, PWA et liste d'attente.

### Regles fortes

- La base est la source de verite pour les droits, les reservations et les stocks.
- Le front ne decide jamais seul qu'un utilisateur est admin.
- Les mutations sensibles passent par Server Actions ou fonctions RPC Supabase.
- Les donnees personnelles sont minimales.
- Les statuts sont des enums PostgreSQL.
- Les actions admin importantes sont journalisees dans `audit_logs`.

## 2. Structure des dossiers

Structure recommandee pour Next.js App Router :

```text
.
├── app
│   ├── (public)
│   │   ├── page.tsx
│   │   ├── planning
│   │   │   ├── page.tsx
│   │   │   └── [occurrenceId]/page.tsx
│   │   ├── reservation/page.tsx
│   │   ├── volants/page.tsx
│   │   ├── inscription/page.tsx
│   │   ├── classements/page.tsx
│   │   ├── equipes/page.tsx
│   │   ├── actualites
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── club/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── venir-essayer/page.tsx
│   │   ├── tarifs/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── sponsors/page.tsx
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   ├── (auth)
│   │   ├── connexion/page.tsx
│   │   ├── inscription-compte/page.tsx
│   │   ├── mot-de-passe-oublie/page.tsx
│   │   └── callback/route.ts
│   ├── (member)
│   │   └── compte
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── reservations/page.tsx
│   │       ├── volants/page.tsx
│   │       ├── classement/page.tsx
│   │       ├── equipes/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── documents/page.tsx
│   │       └── profil/page.tsx
│   ├── admin
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── planning/page.tsx
│   │   ├── planning/nouveau/page.tsx
│   │   ├── reservations/page.tsx
│   │   ├── membres/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── volants/page.tsx
│   │   ├── commandes/page.tsx
│   │   ├── actualites/page.tsx
│   │   ├── evenements/page.tsx
│   │   ├── classements/page.tsx
│   │   ├── classements/import/page.tsx
│   │   ├── ffbad/page.tsx
│   │   ├── gymnases/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── statistiques/page.tsx
│   │   ├── parametres/page.tsx
│   │   └── audit/page.tsx
│   ├── api
│   │   ├── contact/route.ts
│   │   ├── webhooks
│   │   │   └── stripe/route.ts
│   │   └── calendar
│   │       └── club.ics/route.ts
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components
│   ├── ui
│   ├── layout
│   ├── public
│   ├── planning
│   ├── reservation
│   ├── shuttles
│   ├── rankings
│   ├── member
│   ├── admin
│   ├── forms
│   ├── feedback
│   └── seo
├── features
│   ├── auth
│   ├── planning
│   ├── reservations
│   ├── shuttles
│   ├── rankings
│   ├── posts
│   ├── contact
│   ├── member
│   └── admin
├── lib
│   ├── supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── middleware.ts
│   ├── auth
│   │   ├── roles.ts
│   │   ├── require-user.ts
│   │   └── require-role.ts
│   ├── validation
│   ├── dates
│   ├── seo
│   ├── email
│   ├── stripe
│   └── utils.ts
├── services
│   ├── planning.service.ts
│   ├── reservation.service.ts
│   ├── shuttle.service.ts
│   ├── ranking.service.ts
│   ├── member.service.ts
│   ├── admin.service.ts
│   ├── contact.service.ts
│   ├── settings.service.ts
│   └── audit.service.ts
├── hooks
│   ├── use-planning-filters.ts
│   ├── use-slot-reservation.ts
│   ├── use-cancel-reservation.ts
│   ├── use-shuttle-order.ts
│   ├── use-ranking-filters.ts
│   ├── use-admin-table.ts
│   ├── use-media-query.ts
│   └── use-toast.ts
├── types
│   ├── database.types.ts
│   ├── domain.ts
│   ├── roles.ts
│   └── forms.ts
├── supabase
│   ├── migrations
│   ├── seed.sql
│   └── config.toml
├── docs
└── tests
    ├── unit
    ├── integration
    └── e2e
```

## 3. Architecture Next.js

### Server Components par defaut

Les pages publiques et listes initiales sont des Server Components :

- meilleur SEO
- moins de JavaScript client
- chargement initial plus rapide

Client Components uniquement pour :

- filtres interactifs
- modales
- drawers
- toasts
- formulaires
- vues calendrier interactives
- actions optimistic UI

### Server Actions

Server Actions pour :

- reserver un creneau
- annuler une reservation
- creer une commande de volants
- ajuster un stock
- importer un CSV de classements
- modifier les parametres admin
- creer une actualite

Elles appellent Supabase avec le contexte utilisateur, ou des RPC securisees.

### Middleware

Le middleware :

- rafraichit la session Supabase
- redirige les routes privees sans session vers `/connexion`
- protege `/admin` par verification serveur du role
- laisse les pages publiques indexables

## 4. Schema de base de donnees

### Vue globale

```text
auth.users
  └── profiles
        ├── user_roles ── roles
        ├── reservations ── slot_occurrences ── training_slots
        ├── shuttlecock_orders ── shuttlecock_order_items ── shuttlecock_products
        ├── rankings
        ├── notifications
        └── audit_logs

venues
  ├── courts
  ├── training_slots
  ├── slot_occurrences
  └── events

teams
  └── competitions

posts
documents
contact_messages
club_settings
ffbad_links
payments
waiting_list
```

### Extensions et conventions SQL

```sql
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## 5. Types PostgreSQL

```sql
create type public.membership_status as enum (
  'pending',
  'active',
  'inactive',
  'former'
);

create type public.display_preference as enum (
  'full_name',
  'first_initial',
  'nickname'
);

create type public.slot_type as enum (
  'free_play',
  'youth_training',
  'adult_training',
  'competitive_training',
  'beginner_course',
  'interclub',
  'tournament',
  'camp',
  'special_event'
);

create type public.slot_series_status as enum (
  'open',
  'paused',
  'archived'
);

create type public.slot_occurrence_status as enum (
  'open',
  'full',
  'cancelled',
  'competition_reserved',
  'closed'
);

create type public.reservation_status as enum (
  'confirmed',
  'cancelled',
  'admin_cancelled',
  'no_show'
);

create type public.reservation_source as enum (
  'member',
  'admin'
);

create type public.waiting_status as enum (
  'waiting',
  'notified',
  'promoted',
  'cancelled',
  'expired'
);

create type public.shuttle_order_status as enum (
  'pending',
  'reserved',
  'to_pay',
  'paid',
  'picked_up',
  'cancelled'
);

create type public.payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

create type public.payment_provider as enum (
  'manual',
  'stripe'
);

create type public.document_visibility as enum (
  'public',
  'members',
  'admin'
);

create type public.post_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.contact_status as enum (
  'new',
  'in_progress',
  'closed',
  'spam'
);

create type public.ranking_visibility as enum (
  'hidden',
  'limited',
  'members',
  'public'
);
```

## 6. Tables SQL

### profiles

`auth.users` reste la table utilisateur source de Supabase. `profiles` porte les donnees applicatives.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  first_name text,
  last_name text,
  display_name text,
  display_preference public.display_preference not null default 'first_initial',
  phone text,
  membership_status public.membership_status not null default 'pending',
  consent_show_name boolean not null default false,
  consent_email_notifications boolean not null default true,
  ffbad_license_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_membership_status_idx on public.profiles(membership_status);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
```

### roles et user_roles

```sql
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index user_roles_role_id_idx on public.user_roles(role_id);

create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();
```

Roles initiaux :

```sql
insert into public.roles (key, label) values
  ('member', 'Adherent'),
  ('coach', 'Entraineur'),
  ('slot_manager', 'Responsable de creneau'),
  ('shuttle_manager', 'Responsable volants'),
  ('admin', 'Admin club'),
  ('super_admin', 'Super admin');
```

### venues et courts

```sql
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  postal_code text,
  map_url text,
  access_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  court_number int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venues_city_idx on public.venues(city);
create index venues_is_active_idx on public.venues(is_active);
create index courts_venue_id_idx on public.courts(venue_id);

create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create trigger courts_set_updated_at
before update on public.courts
for each row execute function public.set_updated_at();
```

### training_slots

Series recurrentes ou modeles de creneaux.

```sql
create table public.training_slots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.slot_type not null,
  venue_id uuid not null references public.venues(id) on delete restrict,
  weekday int check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  public_label text,
  recommended_level text,
  capacity_max int not null check (capacity_max > 0),
  courts_count int not null default 1 check (courts_count > 0),
  manager_id uuid references public.profiles(id) on delete set null,
  is_recurring boolean not null default true,
  is_public boolean not null default true,
  status public.slot_series_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_slots_time_check check (ends_at > starts_at)
);

create index training_slots_weekday_idx on public.training_slots(weekday);
create index training_slots_type_idx on public.training_slots(type);
create index training_slots_venue_id_idx on public.training_slots(venue_id);
create index training_slots_status_idx on public.training_slots(status);

create trigger training_slots_set_updated_at
before update on public.training_slots
for each row execute function public.set_updated_at();
```

### slot_occurrences

Occurrences datees reservables.

```sql
create table public.slot_occurrences (
  id uuid primary key default gen_random_uuid(),
  training_slot_id uuid references public.training_slots(id) on delete set null,
  venue_id uuid not null references public.venues(id) on delete restrict,
  date date not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity_max int not null check (capacity_max > 0),
  status public.slot_occurrence_status not null default 'open',
  cancellation_reason text,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slot_occurrences_time_check check (ends_at > starts_at)
);

create unique index slot_occurrences_series_date_uidx
on public.slot_occurrences(training_slot_id, date)
where training_slot_id is not null;

create index slot_occurrences_starts_at_idx on public.slot_occurrences(starts_at);
create index slot_occurrences_status_idx on public.slot_occurrences(status);
create index slot_occurrences_venue_id_idx on public.slot_occurrences(venue_id);
create index slot_occurrences_training_slot_id_idx on public.slot_occurrences(training_slot_id);

create trigger slot_occurrences_set_updated_at
before update on public.slot_occurrences
for each row execute function public.set_updated_at();
```

### reservations

```sql
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  slot_occurrence_id uuid not null references public.slot_occurrences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.reservation_status not null default 'confirmed',
  source public.reservation_source not null default 'member',
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index reservations_one_active_per_user_slot_uidx
on public.reservations(slot_occurrence_id, user_id)
where status = 'confirmed';

create index reservations_slot_status_idx on public.reservations(slot_occurrence_id, status);
create index reservations_user_status_idx on public.reservations(user_id, status);
create index reservations_created_at_idx on public.reservations(created_at);

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();
```

### waiting_list

V2, mais prevue dans le schema pour eviter une refonte.

```sql
create table public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  slot_occurrence_id uuid not null references public.slot_occurrences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  position int not null check (position > 0),
  status public.waiting_status not null default 'waiting',
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index waiting_list_user_slot_uidx
on public.waiting_list(slot_occurrence_id, user_id);

create unique index waiting_list_position_uidx
on public.waiting_list(slot_occurrence_id, position)
where status = 'waiting';

create trigger waiting_list_set_updated_at
before update on public.waiting_list
for each row execute function public.set_updated_at();
```

### shuttlecock_products

```sql
create table public.shuttlecock_products (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shuttlecock_products_active_idx on public.shuttlecock_products(is_active);
create index shuttlecock_products_stock_idx on public.shuttlecock_products(stock_quantity);

create trigger shuttlecock_products_set_updated_at
before update on public.shuttlecock_products
for each row execute function public.set_updated_at();
```

### shuttlecock_orders et items

```sql
create table public.shuttlecock_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.shuttle_order_status not null default 'pending',
  total_cents int not null default 0 check (total_cents >= 0),
  payment_method public.payment_provider not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shuttlecock_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shuttlecock_orders(id) on delete cascade,
  product_id uuid not null references public.shuttlecock_products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create index shuttlecock_orders_user_idx on public.shuttlecock_orders(user_id);
create index shuttlecock_orders_status_idx on public.shuttlecock_orders(status);
create index shuttlecock_orders_created_at_idx on public.shuttlecock_orders(created_at);
create index shuttlecock_order_items_order_idx on public.shuttlecock_order_items(order_id);
create index shuttlecock_order_items_product_idx on public.shuttlecock_order_items(product_id);

create trigger shuttlecock_orders_set_updated_at
before update on public.shuttlecock_orders
for each row execute function public.set_updated_at();
```

### payments

Compatible paiement manuel MVP et Stripe V2.

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.shuttlecock_orders(id) on delete set null,
  amount_cents int not null check (amount_cents >= 0),
  status public.payment_status not null default 'pending',
  provider public.payment_provider not null default 'manual',
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index payments_provider_payment_uidx
on public.payments(provider, provider_payment_id)
where provider_payment_id is not null;

create index payments_user_idx on public.payments(user_id);
create index payments_order_idx on public.payments(order_id);
create index payments_status_idx on public.payments(status);

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();
```

### club_settings et ffbad_links

```sql
create table public.club_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ffbad_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index ffbad_links_one_primary_uidx
on public.ffbad_links(is_primary)
where is_primary = true;

create trigger club_settings_set_updated_at
before update on public.club_settings
for each row execute function public.set_updated_at();

create trigger ffbad_links_set_updated_at
before update on public.ffbad_links
for each row execute function public.set_updated_at();
```

### rankings

```sql
create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  season text not null,
  category text,
  single_rank text,
  double_rank text,
  mixed_rank text,
  progression text,
  team text,
  source text not null default 'manual' check (source in ('manual', 'csv')),
  source_updated_at timestamptz,
  public_visibility public.ranking_visibility not null default 'limited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rankings_season_idx on public.rankings(season);
create index rankings_category_idx on public.rankings(category);
create index rankings_user_idx on public.rankings(user_id);
create index rankings_visibility_idx on public.rankings(public_visibility);

create trigger rankings_set_updated_at
before update on public.rankings
for each row execute function public.set_updated_at();
```

### teams et competitions

```sql
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  captain_id uuid references public.profiles(id) on delete set null,
  description text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  name text not null,
  season text,
  official_url text,
  starts_at timestamptz,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teams_active_idx on public.teams(is_active);
create index competitions_team_idx on public.competitions(team_id);
create index competitions_starts_at_idx on public.competitions(starts_at);

create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

create trigger competitions_set_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();
```

### events et posts

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue_id uuid references public.venues(id) on delete set null,
  type text,
  is_public boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category text,
  published_at timestamptz,
  status public.post_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events(starts_at);
create index events_public_idx on public.events(is_public);
create index posts_status_published_idx on public.posts(status, published_at);
create index posts_category_idx on public.posts(category);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();
```

### documents

```sql
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_path text not null,
  visibility public.document_visibility not null default 'members',
  category text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_visibility_idx on public.documents(visibility);
create index documents_category_idx on public.documents(category);

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();
```

### notifications

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_read_idx on public.notifications(user_id, read_at);
create index notifications_created_at_idx on public.notifications(created_at);
```

### contact_messages

```sql
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null,
  subject text,
  type text not null,
  message text not null,
  status public.contact_status not null default 'new',
  handled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages(status);
create index contact_messages_created_at_idx on public.contact_messages(created_at);

create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();
```

### audit_logs

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_idx on public.audit_logs(actor_id);
create index audit_logs_target_idx on public.audit_logs(target_table, target_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);
```

## 7. Relations principales

### Auth et roles

- `auth.users.id` 1-1 `profiles.id`
- `profiles.id` n-n `roles.id` via `user_roles`

### Planning

- `venues.id` 1-n `courts.venue_id`
- `venues.id` 1-n `training_slots.venue_id`
- `training_slots.id` 1-n `slot_occurrences.training_slot_id`
- `slot_occurrences.id` 1-n `reservations.slot_occurrence_id`
- `profiles.id` 1-n `reservations.user_id`
- `slot_occurrences.id` 1-n `waiting_list.slot_occurrence_id`

### Volants

- `profiles.id` 1-n `shuttlecock_orders.user_id`
- `shuttlecock_orders.id` 1-n `shuttlecock_order_items.order_id`
- `shuttlecock_products.id` 1-n `shuttlecock_order_items.product_id`
- `shuttlecock_orders.id` 1-n `payments.order_id`

### Contenu

- `profiles.id` 1-n `posts.author_id`
- `venues.id` 1-n `events.venue_id`
- `teams.id` 1-n `competitions.team_id`

## 8. Regles de securite

### Helpers RLS

Fonctions recommandees :

```sql
create or replace function public.has_role(role_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.key = role_key
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

create or replace function public.is_shuttle_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.has_role('shuttle_manager');
$$;
```

### Activation RLS

```sql
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.venues enable row level security;
alter table public.courts enable row level security;
alter table public.training_slots enable row level security;
alter table public.slot_occurrences enable row level security;
alter table public.reservations enable row level security;
alter table public.waiting_list enable row level security;
alter table public.shuttlecock_products enable row level security;
alter table public.shuttlecock_orders enable row level security;
alter table public.shuttlecock_order_items enable row level security;
alter table public.payments enable row level security;
alter table public.club_settings enable row level security;
alter table public.ffbad_links enable row level security;
alter table public.rankings enable row level security;
alter table public.teams enable row level security;
alter table public.competitions enable row level security;
alter table public.events enable row level security;
alter table public.posts enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;
```

### Policies par famille

Profiles :

- l'utilisateur lit son profil
- l'utilisateur modifie ses champs autorises via Server Action
- admin lit et modifie les profils

```sql
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());
```

Roles :

- lecture par utilisateur connecte pour afficher ses droits
- ecriture admin seulement

```sql
create policy "roles_select_authenticated"
on public.roles for select
to authenticated
using (true);

create policy "user_roles_select_own_or_admin"
on public.user_roles for select
using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_admin_all"
on public.user_roles for all
using (public.is_admin())
with check (public.is_admin());
```

Planning public :

- lecture publique des lieux actifs, creneaux publics et occurrences publiques
- gestion admin et responsables autorises

```sql
create policy "venues_public_read_active"
on public.venues for select
using (is_active = true or public.is_admin());

create policy "venues_admin_all"
on public.venues for all
using (public.is_admin())
with check (public.is_admin());

create policy "training_slots_public_read"
on public.training_slots for select
using (is_public = true or public.is_admin());

create policy "training_slots_admin_all"
on public.training_slots for all
using (public.is_admin())
with check (public.is_admin());

create policy "slot_occurrences_public_read"
on public.slot_occurrences for select
using (true);

create policy "slot_occurrences_admin_all"
on public.slot_occurrences for all
using (public.is_admin())
with check (public.is_admin());
```

Reservations :

- membre lit ses reservations
- responsable lit les inscrits de ses occurrences
- admin lit tout
- insertion directe a eviter ; passer par RPC `reserve_slot`

```sql
create policy "reservations_select_own_manager_or_admin"
on public.reservations for select
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.slot_occurrences so
    where so.id = reservations.slot_occurrence_id
      and so.manager_id = auth.uid()
  )
);

create policy "reservations_admin_all"
on public.reservations for all
using (public.is_admin())
with check (public.is_admin());
```

Volants :

- produits actifs visibles par tous
- commandes visibles par proprietaire et responsables volants
- stock modifiable par responsable volants/admin

```sql
create policy "shuttle_products_public_read_active"
on public.shuttlecock_products for select
using (is_active = true or public.is_shuttle_manager());

create policy "shuttle_products_manager_all"
on public.shuttlecock_products for all
using (public.is_shuttle_manager())
with check (public.is_shuttle_manager());

create policy "shuttle_orders_select_own_or_manager"
on public.shuttlecock_orders for select
using (user_id = auth.uid() or public.is_shuttle_manager());

create policy "shuttle_orders_manager_all"
on public.shuttlecock_orders for all
using (public.is_shuttle_manager())
with check (public.is_shuttle_manager());
```

Rankings :

- public lit `public`
- visiteurs lisent version limitee via vue ou selection controlee
- adherents lisent `members`
- admin gere tout

```sql
create policy "rankings_select_by_visibility"
on public.rankings for select
using (
  public_visibility = 'public'
  or (auth.uid() is not null and public_visibility in ('limited', 'members'))
  or public.is_admin()
);

create policy "rankings_admin_all"
on public.rankings for all
using (public.is_admin())
with check (public.is_admin());
```

Contenu :

- posts publies lus par tous
- drafts admin
- documents selon visibilite

```sql
create policy "posts_public_read_published"
on public.posts for select
using (status = 'published' or public.is_admin());

create policy "posts_admin_all"
on public.posts for all
using (public.is_admin())
with check (public.is_admin());

create policy "documents_select_by_visibility"
on public.documents for select
using (
  visibility = 'public'
  or (visibility = 'members' and auth.uid() is not null)
  or public.is_admin()
);

create policy "documents_admin_all"
on public.documents for all
using (public.is_admin())
with check (public.is_admin());
```

Notifications :

```sql
create policy "notifications_own"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());
```

Audit logs :

- lecture admin seulement
- insertion via Server Action/RPC admin

```sql
create policy "audit_logs_admin_select"
on public.audit_logs for select
using (public.is_admin());
```

## 9. Routes publiques

| Route | Role | Donnees |
| --- | --- | --- |
| `/` | Accueil | prochains creneaux, evenements, stats, alerte |
| `/planning` | Planning public | occurrences, lieux, filtres |
| `/planning/[occurrenceId]` | Detail creneau | occurrence, lieu, places, participants limites |
| `/reservation` | Entree reservation | redirige connexion si action reservee |
| `/volants` | Produits volants | produits actifs, commande si connecte |
| `/inscription` | Inscription club | tarifs, etapes, lien FFBaD |
| `/classements` | Classements publics | rankings selon visibilite |
| `/equipes` | Equipes | teams, competitions |
| `/actualites` | Blog | posts publies |
| `/actualites/[slug]` | Article | post publie |
| `/club` | Club | bureau, gymnases, valeurs |
| `/contact` | Contact | formulaire contact |
| `/venir-essayer` | Essai | formulaire essai |
| `/tarifs` | Tarifs | settings/tarifs |
| `/faq` | FAQ | contenu statique ou posts |
| `/documents` | Documents publics | documents public |
| `/mentions-legales` | Legal | statique |
| `/confidentialite` | RGPD | statique |

## 10. Routes privees adherent

Toutes demandent une session.

| Route | Role minimal | Fonction |
| --- | --- | --- |
| `/compte` | authenticated | dashboard adherent |
| `/compte/reservations` | member | reservations futures et historique |
| `/compte/volants` | member | commandes volants |
| `/compte/classement` | member | classement personnel |
| `/compte/equipes` | member | equipes personnelles |
| `/compte/notifications` | member | notifications |
| `/compte/documents` | member | documents internes |
| `/compte/profil` | authenticated | profil et consentements |

## 11. Routes admin

Toutes demandent `admin` ou role specifique.

| Route | Role minimal | Fonction |
| --- | --- | --- |
| `/admin` | admin | synthese admin |
| `/admin/planning` | admin ou slot_manager | gestion occurrences |
| `/admin/planning/nouveau` | admin ou slot_manager | creation creneau |
| `/admin/reservations` | admin ou slot_manager | gestion reservations |
| `/admin/membres` | admin | membres |
| `/admin/roles` | admin | roles |
| `/admin/volants` | shuttle_manager | produits et stock |
| `/admin/commandes` | shuttle_manager | commandes volants |
| `/admin/actualites` | admin | posts |
| `/admin/evenements` | admin | events |
| `/admin/classements` | admin | edition classements |
| `/admin/classements/import` | admin | import CSV |
| `/admin/ffbad` | admin | lien FFBaD |
| `/admin/gymnases` | admin | venues/courts |
| `/admin/documents` | admin | documents |
| `/admin/messages` | admin | contacts |
| `/admin/statistiques` | admin | stats V2 |
| `/admin/parametres` | admin | settings |
| `/admin/audit` | super_admin ou admin restreint | logs |

## 12. Composants React

### UI primitives

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Combobox`
- `Checkbox`
- `Switch`
- `Dialog`
- `Drawer`
- `Sheet`
- `Tabs`
- `Toast`
- `Badge`
- `Card`
- `Table`
- `Skeleton`
- `EmptyState`
- `ErrorState`

### Layout

- `SiteHeader`
- `SiteFooter`
- `MobileBottomNav`
- `PublicPageShell`
- `MemberShell`
- `AdminShell`
- `AdminSidebar`
- `AdminTopbar`
- `PageHeader`
- `Section`

### Public

- `HeroClub`
- `SiteAlert`
- `QuickActionGrid`
- `StatsBand`
- `TrainingAudienceCards`
- `SponsorStrip`
- `VenueCard`
- `ContactForm`
- `TrialRequestForm`

### Planning

- `PlanningToolbar`
- `PlanningFiltersDrawer`
- `PlanningViewToggle`
- `SlotList`
- `SlotCard`
- `CalendarWeekView`
- `SlotStatusBadge`
- `LevelBadge`
- `PlacesIndicator`
- `AddToCalendarButton`

### Reservation

- `ReservationModal`
- `ReservationSummary`
- `AttendeeList`
- `CancelReservationDialog`
- `ReservationRuleNotice`
- `WaitlistNotice`

### Volants

- `ShuttleProductGrid`
- `ShuttleProductCard`
- `QuantityStepper`
- `OrderSummary`
- `OrderStatusBadge`
- `StockBadge`
- `AdminStockAdjustDialog`

### Classements

- `RankingToolbar`
- `RankingTable`
- `RankingCardMobile`
- `ProgressionBadge`
- `CsvImportDropzone`
- `CsvPreviewTable`

### Compte

- `MemberDashboard`
- `NextReservationCard`
- `MyReservationsList`
- `MyOrdersList`
- `ProfileForm`
- `NotificationList`
- `MemberDocumentList`

### Admin

- `AdminMetricCard`
- `AdminActionGrid`
- `AdminDataTable`
- `SlotEditorForm`
- `OccurrenceCancelDialog`
- `RecurringSlotForm`
- `MemberRoleSelect`
- `OrderStatusSelect`
- `PostEditor`
- `SettingsForm`
- `AuditLogTable`

## 13. Services

Les services centralisent les acces donnees et les appels RPC.

### `planning.service.ts`

- `getPublicPlanning(filters)`
- `getSlotOccurrence(id)`
- `getUpcomingSlots(limit)`
- `getAdminPlanning(filters)`
- `createTrainingSlot(input)`
- `createSlotOccurrence(input)`
- `cancelOccurrence(input)`
- `duplicateWeeklySlot(input)`

### `reservation.service.ts`

- `reserveSlot(occurrenceId)`
- `cancelReservation(reservationId)`
- `getMyReservations()`
- `getOccurrenceAttendees(occurrenceId)`
- `adminForceReservation(input)`
- `adminCancelReservation(input)`

### `shuttle.service.ts`

- `getActiveProducts()`
- `createOrder(input)`
- `getMyOrders()`
- `getAdminOrders(filters)`
- `updateOrderStatus(input)`
- `adjustStock(input)`
- `upsertProduct(input)`

### `ranking.service.ts`

- `getPublicRankings(filters)`
- `getMemberRanking(userId)`
- `getAdminRankings(filters)`
- `importRankingsCsv(file)`
- `upsertRanking(input)`

### `settings.service.ts`

- `getPublicSettings()`
- `getAdminSettings()`
- `updateSetting(key, value)`
- `getFfbadPrimaryLink()`
- `updateFfbadLink(input)`

### `audit.service.ts`

- `writeAuditLog(action, target, metadata)`
- `getAuditLogs(filters)`

## 14. Hooks

### Hooks UI

- `useMediaQuery(query)`
- `useToast()`
- `useDebouncedValue(value, delay)`
- `useDisclosure()`

### Hooks planning

- `usePlanningFilters()`
- `usePlanningViewMode()`
- `useSlotAvailability(occurrenceId)`

### Hooks reservation

- `useSlotReservation()`
- `useCancelReservation()`
- `useReservationRules()`

### Hooks volants

- `useShuttleOrder()`
- `useQuantityStepper({ min, max })`
- `useOrderStatusMutation()`

### Hooks admin

- `useAdminTable()`
- `useCsvImportPreview()`
- `useOptimisticStatusUpdate()`

## 15. Strategie de reservation

### Flux membre

1. L'utilisateur ouvre `/planning`.
2. Il filtre les creneaux.
3. Il clique "Reserver ma place".
4. Si non connecté, redirection `/connexion?next=/planning/[id]`.
5. La modale affiche recapitulatif, places et regle d'annulation.
6. La Server Action appelle `reserve_slot(occurrence_id)`.
7. La base verifie role, statut, capacite, quota et unicite.
8. La reservation est creee ou une erreur metier est retournee.
9. Le front affiche toast + mise a jour de la carte.

### Fonction RPC de reservation

La fonction `reserve_slot` doit :

- verifier `auth.uid()`
- verifier profil actif
- verrouiller l'occurrence `for update`
- verifier statut `open`
- verifier date limite de reservation
- verifier quota de reservations actives
- verifier absence de reservation active existante
- compter les reservations confirmees
- refuser si capacite atteinte
- inserer reservation
- mettre a jour statut occurrence si complete
- ecrire audit log leger

Pseudo-flux SQL :

```text
begin
  user_id = auth.uid()
  lock occurrence for update
  check member active
  check occurrence open
  check quota
  check not already reserved
  count confirmed reservations
  if count >= capacity -> error slot_full
  insert reservation confirmed
  if count + 1 = capacity -> update occurrence status full
  return reservation
end
```

### Annulation

La fonction `cancel_reservation` doit :

- verifier proprietaire ou admin
- verifier statut confirmed
- verifier deadline si membre
- passer statut a `cancelled` ou `admin_cancelled`
- liberer la place
- repasser occurrence a `open` si elle etait `full`
- V2 : notifier la liste d'attente

### Liste d'attente V2

La liste d'attente est activee seulement apres MVP :

- si complet, proposer "Rejoindre la liste d'attente"
- position calculee transactionnellement
- promotion automatique ou manuelle
- notification email
- expiration configurable

## 16. Strategie de gestion des volants

### MVP paiement sur place

Flux :

1. L'adherent choisit un produit actif.
2. Il choisit une quantite.
3. La Server Action appelle une RPC ou transaction.
4. La base verrouille les produits commandes.
5. La base verifie stock disponible.
6. Elle cree `shuttlecock_orders`.
7. Elle cree les items.
8. Elle decremente le stock.
9. Statut initial : `reserved` ou `to_pay`.
10. Le responsable marque `paid`, puis `picked_up`.

### Regles de stock

- Stock jamais negatif.
- Prix copie dans `unit_price_cents` au moment de la commande.
- Annulation admin remet le stock si commande non recuperee.
- Ajustement manuel exige une raison et un audit log.

### Stripe V2

Preparation deja prevue :

- `payments.provider = 'stripe'`
- `provider_payment_id`
- webhook `/api/webhooks/stripe`
- passage commande `paid` apres evenement Stripe valide
- jamais de donnees carte bancaire stockees

## 17. Strategie d'import des classements

### MVP CSV

Format recommande :

```csv
email,first_name,last_name,category,single_rank,double_rank,mixed_rank,progression,team,public_visibility
```

Flux admin :

1. Upload CSV dans `/admin/classements/import`.
2. Parsing cote serveur.
3. Validation Zod ligne par ligne.
4. Preview : lignes valides, avertissements, erreurs.
5. Matching utilisateur par email.
6. Import transactionnel.
7. Historique via `audit_logs`.
8. Date de mise a jour visible sur page publique.

### Regles

- Pas de scraping.
- Email utilise pour matcher un profil si present.
- Si aucun profil ne correspond, soit ignorer, soit creer une ligne non liee selon option admin.
- Les noms affiches respectent `public_visibility` et les preferences RGPD.
- Les imports sont idempotents par `season + user_id` si utilisateur lie.

### Evolutions V2

- modele CSV telechargeable
- rollback du dernier import
- rapports d'erreurs detailles
- import depuis fichier stocke Supabase Storage

## 18. Strategie Supabase Storage

Buckets :

- `public-assets` : images publiques, sponsors, couverture articles.
- `member-documents` : documents adherents.
- `admin-imports` : CSV imports temporaires.

Regles :

- `public-assets` lisible publiquement, ecriture admin.
- `member-documents` lisible authenticated, ecriture admin.
- `admin-imports` lisible/ecriture admin seulement.
- Les fichiers sensibles ne sont pas publics.

## 19. Strategie SEO et metadata

### Next.js metadata

- `generateMetadata` par page dynamique.
- title localise : club + ville + sujet.
- descriptions courtes.
- Open Graph pour accueil, articles, evenements.

### Donnees structurees

Composant `LocalBusinessJsonLd` :

- nom club
- adresse
- ville
- URL
- type sport
- horaires si connus

Composant `EventJsonLd` pour evenements publics.

### Sitemap

Inclure :

- pages publiques statiques
- articles publies
- evenements publics

Exclure :

- compte
- admin
- pages auth

## 20. Strategie tests

### Unitaires

- validation formulaires
- helpers dates
- libelles statuts
- calcul places restantes
- parsing CSV

### Integration

- RPC reservation
- annulation
- commande volants
- import classements
- policies RLS critiques

### E2E

- visiteur consulte planning
- utilisateur reserve un creneau
- utilisateur annule
- admin annule une occurrence
- adherent commande des volants
- responsable marque commande payee
- admin importe classements

## 21. Plan d'implementation etape par etape

### Phase 0 - Decisions projet

- Valider nom du club, ville, gymnases.
- Valider couleur d'accent finale.
- Valider regles : quota, delai ouverture, delai annulation.
- Valider affichage RGPD par defaut.
- Valider paiement sur place MVP.

### Phase 1 - Initialisation technique

- Creer projet Next.js TypeScript.
- Installer Tailwind CSS.
- Ajouter shadcn/ui.
- Configurer ESLint, Prettier si souhaite, scripts.
- Configurer variables `.env.local`.
- Ajouter clients Supabase server/client.
- Ajouter middleware session Supabase.

### Phase 2 - Design system

- Tokens couleurs et typo.
- Layout public.
- Header, footer, nav mobile.
- Button, Badge, Card, Input, Dialog, Drawer, Skeleton.
- EmptyState et ErrorState.

### Phase 3 - Supabase schema

- Creer migrations enums + tables.
- Activer RLS.
- Ajouter roles initiaux.
- Ajouter settings initiaux.
- Ajouter seed gymnase/creneaux demo.
- Generer types TypeScript Supabase.

### Phase 4 - Auth et roles

- Pages connexion.
- Callback Supabase.
- Creation profil au premier login.
- Helpers `requireUser`, `requireRole`.
- Protection `/compte`.
- Protection `/admin`.

### Phase 5 - Pages publiques MVP

- Accueil.
- Planning liste.
- Detail creneau.
- Inscription avec lien FFBaD configurable.
- Contact.
- Classements publics basiques.
- Volants catalogue.

### Phase 6 - Reservation MVP

- `reserve_slot` RPC.
- Server Action reservation.
- Modal reservation.
- Annulation.
- Mes reservations.
- Liste inscrits selon droits.
- Tests de capacite et quota.

### Phase 7 - Volants MVP

- Produits actifs.
- Commande paiement sur place.
- Stock transactionnel.
- Mes commandes.
- Admin produits.
- Admin commandes.

### Phase 8 - Admin MVP

- Admin shell.
- Dashboard synthese.
- Gestion planning.
- Annulation occurrence.
- Gestion membres/roles.
- Gestion FFBaD.
- Alerte site.
- Messages contact.

### Phase 9 - Classements MVP

- Import CSV.
- Preview validation.
- Insertion/update rankings.
- Table admin.
- Affichage public/adherent selon visibilite.

### Phase 10 - Polish

- Responsive mobile complet.
- Accessibilite clavier.
- SEO metadata.
- Open Graph.
- Etats chargement/erreur.
- Scenarios manuels.

### Phase 11 - V2

- Liste d'attente.
- Emails Resend.
- Stripe.
- Export ICS.
- Stats admin.
- Documents internes.
- PWA.

## 22. Risques techniques et parades

### Capacite depassee

Risque :

- deux utilisateurs reservent en meme temps.

Parade :

- RPC transactionnelle avec verrou `for update`.

### RLS trop permissive

Risque :

- exposition de donnees adherents.

Parade :

- policies minimales.
- tests RLS.
- vues publiques limitees pour classements et participants.

### Admin trop complexe

Risque :

- le club n'utilise pas l'outil.

Parade :

- actions rapides.
- MVP admin restreint.
- listes filtrees.

### Paiement trop tot

Risque :

- complexite Stripe avant validation usage.

Parade :

- statut paiement sur place en MVP.
- tables compatibles Stripe des le depart.

### CSV instable

Risque :

- imports classements erreurs.

Parade :

- preview avant import.
- validation stricte.
- rapport erreurs.
- audit log.

