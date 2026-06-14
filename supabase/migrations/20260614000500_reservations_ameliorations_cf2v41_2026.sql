-- Ameliorations reservations CF2V41 : places restantes, liste d'attente,
-- annulation encadree, annulations exceptionnelles et reservations lisibles admin.
-- A executer dans l'editeur SQL Supabase apres schema.sql et rls.sql.

create table if not exists public.waiting_list (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  creneau_id bigint not null references public.creneaux(id) on delete cascade,
  date_reservation date not null,
  statut text not null default 'en_attente',
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waiting_list_statut_check check (statut in ('en_attente', 'notifiee', 'reservee', 'annulee'))
);

create index if not exists waiting_list_user_idx on public.waiting_list(user_id);
create index if not exists waiting_list_creneau_date_idx on public.waiting_list(creneau_id, date_reservation);
create index if not exists waiting_list_statut_idx on public.waiting_list(statut);

drop index if exists waiting_list_unique_active_idx;
create unique index waiting_list_unique_active_idx
on public.waiting_list(user_id, creneau_id, date_reservation)
where statut in ('en_attente', 'notifiee');

drop trigger if exists waiting_list_set_updated_at on public.waiting_list;
create trigger waiting_list_set_updated_at
before update on public.waiting_list
for each row execute function public.set_updated_at();

create table if not exists public.creneau_annulations (
  id bigint generated always as identity primary key,
  creneau_id bigint not null references public.creneaux(id) on delete cascade,
  date_reservation date not null,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists creneau_annulations_unique_idx
on public.creneau_annulations(creneau_id, date_reservation);
create index if not exists creneau_annulations_date_idx on public.creneau_annulations(date_reservation);

drop trigger if exists creneau_annulations_set_updated_at on public.creneau_annulations;
create trigger creneau_annulations_set_updated_at
before update on public.creneau_annulations
for each row execute function public.set_updated_at();

drop index if exists reservations_unique_user_creneau_date_idx;
create unique index reservations_unique_user_creneau_date_idx
on public.reservations(user_id, creneau_id, date_reservation)
where statut in ('en_attente', 'confirmee');

create or replace function public.french_day_for_date(target_date date)
returns text
language sql
immutable
as $$
  select case extract(isodow from target_date)::int
    when 1 then 'lundi'
    when 2 then 'mardi'
    when 3 then 'mercredi'
    when 4 then 'jeudi'
    when 5 then 'vendredi'
    when 6 then 'samedi'
    else 'dimanche'
  end;
$$;

create or replace function public.list_creneaux_availability(start_date date default current_date, end_date date default current_date + 6)
returns table (
  id bigint,
  jour text,
  heure_debut time,
  heure_fin time,
  gymnase text,
  adresse text,
  type text,
  public text,
  niveau text,
  places_max integer,
  responsable text,
  actif boolean,
  occurrence_date date,
  reserved_count integer,
  waiting_count integer,
  places_left integer,
  is_cancelled boolean,
  cancellation_reason text,
  user_reservation_status text,
  user_waiting_status text
)
language sql
stable
security definer
set search_path = public
as $$
  with days as (
    select day::date as occurrence_date, public.french_day_for_date(day::date) as jour_key
    from generate_series(start_date, end_date, interval '1 day') as day
  ),
  base as (
    select c.*, d.occurrence_date
    from public.creneaux c
    join days d on lower(c.jour) = d.jour_key
    where c.actif = true
  ),
  reservation_counts as (
    select r.creneau_id, r.date_reservation, count(*)::int as reserved_count
    from public.reservations r
    where r.statut = 'confirmee'
      and r.date_reservation between start_date and end_date
    group by r.creneau_id, r.date_reservation
  ),
  waiting_counts as (
    select w.creneau_id, w.date_reservation, count(*)::int as waiting_count
    from public.waiting_list w
    where w.statut in ('en_attente', 'notifiee')
      and w.date_reservation between start_date and end_date
    group by w.creneau_id, w.date_reservation
  )
  select
    b.id,
    b.jour,
    b.heure_debut,
    b.heure_fin,
    b.gymnase,
    b.adresse,
    b.type,
    b.public,
    b.niveau,
    b.places_max,
    b.responsable,
    b.actif,
    b.occurrence_date,
    coalesce(rc.reserved_count, 0) as reserved_count,
    coalesce(wc.waiting_count, 0) as waiting_count,
    case
      when b.places_max is null then null
      else greatest(b.places_max - coalesce(rc.reserved_count, 0), 0)
    end as places_left,
    ca.id is not null as is_cancelled,
    ca.reason as cancellation_reason,
    (
      select r.statut
      from public.reservations r
      where r.user_id = auth.uid()
        and r.creneau_id = b.id
        and r.date_reservation = b.occurrence_date
      order by r.id desc
      limit 1
    ) as user_reservation_status,
    (
      select w.statut
      from public.waiting_list w
      where w.user_id = auth.uid()
        and w.creneau_id = b.id
        and w.date_reservation = b.occurrence_date
      order by w.id desc
      limit 1
    ) as user_waiting_status
  from base b
  left join reservation_counts rc on rc.creneau_id = b.id and rc.date_reservation = b.occurrence_date
  left join waiting_counts wc on wc.creneau_id = b.id and wc.date_reservation = b.occurrence_date
  left join public.creneau_annulations ca on ca.creneau_id = b.id and ca.date_reservation = b.occurrence_date
  order by b.occurrence_date, b.heure_debut;
$$;

revoke all on function public.list_creneaux_availability(date, date) from public;
grant execute on function public.list_creneaux_availability(date, date) to anon, authenticated;

create or replace function public.reserve_creneau(target_creneau_id bigint, target_date date)
returns table (
  status text,
  message text,
  reservation_id bigint,
  waiting_id bigint,
  places_left integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  slot_record public.creneaux%rowtype;
  reserved_count integer;
  waiting_count integer;
  created_reservation_id bigint;
  created_waiting_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  select *
  into slot_record
  from public.creneaux
  where id = target_creneau_id
  for update;

  if slot_record.id is null or not slot_record.actif then
    raise exception 'Creneau indisponible';
  end if;

  if lower(slot_record.jour) <> public.french_day_for_date(target_date) then
    raise exception 'La date choisie ne correspond pas au jour du creneau';
  end if;

  if exists (
    select 1
    from public.creneau_annulations ca
    where ca.creneau_id = target_creneau_id
      and ca.date_reservation = target_date
  ) then
    raise exception 'Ce creneau est annule pour cette date';
  end if;

  if exists (
    select 1
    from public.reservations r
    where r.user_id = auth.uid()
      and r.creneau_id = target_creneau_id
      and r.date_reservation = target_date
      and r.statut in ('en_attente', 'confirmee')
  ) then
    raise exception 'Tu as deja reserve ce creneau';
  end if;

  if exists (
    select 1
    from public.waiting_list w
    where w.user_id = auth.uid()
      and w.creneau_id = target_creneau_id
      and w.date_reservation = target_date
      and w.statut in ('en_attente', 'notifiee')
  ) then
    raise exception 'Tu es deja sur la liste d''attente';
  end if;

  select count(*)::int
  into reserved_count
  from public.reservations r
  where r.creneau_id = target_creneau_id
    and r.date_reservation = target_date
    and r.statut = 'confirmee';

  if slot_record.places_max is null or reserved_count < slot_record.places_max then
    insert into public.reservations (user_id, creneau_id, date_reservation, statut)
    values (auth.uid(), target_creneau_id, target_date, 'confirmee')
    returning id into created_reservation_id;

    return query
    select
      'confirmee'::text,
      'Reservation confirmee.'::text,
      created_reservation_id,
      null::bigint,
      case
        when slot_record.places_max is null then null
        else greatest(slot_record.places_max - reserved_count - 1, 0)
      end;
    return;
  end if;

  insert into public.waiting_list (user_id, creneau_id, date_reservation, statut)
  values (auth.uid(), target_creneau_id, target_date, 'en_attente')
  returning id into created_waiting_id;

  select count(*)::int
  into waiting_count
  from public.waiting_list w
  where w.creneau_id = target_creneau_id
    and w.date_reservation = target_date
    and w.statut in ('en_attente', 'notifiee');

  return query
  select
    'liste_attente'::text,
    ('Creneau complet : tu es sur la liste d''attente en position ' || waiting_count || '.')::text,
    null::bigint,
    created_waiting_id,
    0;
end;
$$;

revoke all on function public.reserve_creneau(bigint, date) from public;
grant execute on function public.reserve_creneau(bigint, date) to authenticated;

create or replace function public.cancel_reservation(target_reservation_id bigint)
returns table (
  status text,
  message text,
  notified_user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record public.reservations%rowtype;
  slot_record public.creneaux%rowtype;
  next_waiting public.waiting_list%rowtype;
  occurrence_start timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  select *
  into reservation_record
  from public.reservations
  where id = target_reservation_id
  for update;

  if reservation_record.id is null then
    raise exception 'Reservation introuvable';
  end if;

  select *
  into slot_record
  from public.creneaux
  where id = reservation_record.creneau_id;

  if not public.is_manager() and reservation_record.user_id <> auth.uid() then
    raise exception 'Annulation non autorisee';
  end if;

  occurrence_start := ((reservation_record.date_reservation + slot_record.heure_debut) at time zone 'Europe/Paris');

  if not public.is_manager() and occurrence_start <= now() + interval '2 hours' then
    raise exception 'Annulation impossible moins de 2 heures avant le creneau';
  end if;

  update public.reservations
  set statut = 'annulee'
  where id = target_reservation_id;

  select *
  into next_waiting
  from public.waiting_list
  where creneau_id = reservation_record.creneau_id
    and date_reservation = reservation_record.date_reservation
    and statut = 'en_attente'
  order by created_at asc, id asc
  limit 1
  for update skip locked;

  if next_waiting.id is not null then
    update public.waiting_list
    set statut = 'notifiee',
        notified_at = now()
    where id = next_waiting.id;

    return query
    select
      'annulee'::text,
      'Reservation annulee. Une personne en liste d''attente peut etre contactee.'::text,
      next_waiting.user_id;
    return;
  end if;

  return query
  select 'annulee'::text, 'Reservation annulee.'::text, null::uuid;
end;
$$;

revoke all on function public.cancel_reservation(bigint) from public;
grant execute on function public.cancel_reservation(bigint) to authenticated;

create or replace function public.list_reservations_for_manager()
returns table (
  id bigint,
  user_id uuid,
  member_name text,
  member_email text,
  creneau_id bigint,
  date_reservation date,
  statut text,
  commentaire text,
  creneau_jour text,
  creneau_heure_debut time,
  creneau_heure_fin time,
  creneau_gymnase text,
  creneau_adresse text,
  creneau_type text,
  creneau_public text,
  creneau_niveau text,
  creneau_places_max integer,
  creneau_responsable text,
  creneau_actif boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  return query
  select
    r.id,
    r.user_id,
    nullif(trim(concat(coalesce(p.prenom, ''), ' ', coalesce(p.nom, ''))), '') as member_name,
    p.email as member_email,
    r.creneau_id,
    r.date_reservation,
    r.statut,
    r.commentaire,
    c.jour,
    c.heure_debut,
    c.heure_fin,
    c.gymnase,
    c.adresse,
    c.type,
    c.public,
    c.niveau,
    c.places_max,
    c.responsable,
    c.actif
  from public.reservations r
  left join public.profiles p on p.id = r.user_id
  left join public.creneaux c on c.id = r.creneau_id
  order by r.date_reservation desc, c.heure_debut asc;
end;
$$;

revoke all on function public.list_reservations_for_manager() from public;
grant execute on function public.list_reservations_for_manager() to authenticated;

create or replace function public.create_creneau_cancellation(target_creneau_id bigint, target_date date, target_reason text default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  created_id bigint;
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  insert into public.creneau_annulations (creneau_id, date_reservation, reason, created_by)
  values (target_creneau_id, target_date, nullif(trim(coalesce(target_reason, '')), ''), auth.uid())
  on conflict (creneau_id, date_reservation)
  do update set
    reason = excluded.reason,
    updated_at = now()
  returning id into created_id;

  update public.reservations
  set statut = 'annulee'
  where creneau_id = target_creneau_id
    and date_reservation = target_date
    and statut in ('en_attente', 'confirmee');

  update public.waiting_list
  set statut = 'annulee'
  where creneau_id = target_creneau_id
    and date_reservation = target_date
    and statut in ('en_attente', 'notifiee');

  return created_id;
end;
$$;

revoke all on function public.create_creneau_cancellation(bigint, date, text) from public;
grant execute on function public.create_creneau_cancellation(bigint, date, text) to authenticated;

create or replace function public.delete_creneau_cancellation(target_cancellation_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  delete from public.creneau_annulations
  where id = target_cancellation_id;
end;
$$;

revoke all on function public.delete_creneau_cancellation(bigint) from public;
grant execute on function public.delete_creneau_cancellation(bigint) to authenticated;

alter table public.waiting_list enable row level security;
alter table public.creneau_annulations enable row level security;

drop policy if exists "waiting_list_insert_own" on public.waiting_list;
drop policy if exists "waiting_list_select_own_or_manager" on public.waiting_list;
drop policy if exists "waiting_list_update_own_cancel" on public.waiting_list;
drop policy if exists "waiting_list_manager_all" on public.waiting_list;

drop policy if exists "creneau_annulations_select_all" on public.creneau_annulations;
drop policy if exists "creneau_annulations_manager_all" on public.creneau_annulations;

create policy "waiting_list_insert_own"
on public.waiting_list
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "waiting_list_select_own_or_manager"
on public.waiting_list
for select
using (auth.uid() = user_id or public.is_manager());

create policy "waiting_list_update_own_cancel"
on public.waiting_list
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and statut = 'annulee');

create policy "waiting_list_manager_all"
on public.waiting_list
for all
using (public.is_manager())
with check (public.is_manager());

create policy "creneau_annulations_select_all"
on public.creneau_annulations
for select
using (true);

create policy "creneau_annulations_manager_all"
on public.creneau_annulations
for all
using (public.is_manager())
with check (public.is_manager());
