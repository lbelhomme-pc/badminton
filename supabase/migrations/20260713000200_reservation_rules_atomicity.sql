-- Règles configurables et garanties d'atomicité pour les réservations CFVV.
-- À exécuter après les migrations de réservation 2026.

alter table public.profiles drop constraint if exists profiles_statut_check;
alter table public.profiles
add constraint profiles_statut_check check (statut in ('en_attente', 'actif', 'inactif', 'ancien', 'suspendu', 'non_renouvele'));

alter table public.creneaux add column if not exists reservation_active boolean;
alter table public.creneaux add column if not exists reservation_open_days integer;
alter table public.creneaux add column if not exists reservation_open_time time;
alter table public.creneaux add column if not exists reservation_close_minutes_before integer;
alter table public.creneaux add column if not exists cancellation_deadline_hours integer;
alter table public.creneaux add column if not exists reservation_message text;

update public.creneaux
set reservation_active = lower(jour) in ('mercredi', 'vendredi')
where reservation_active is null;

update public.creneaux set reservation_open_days = 7 where reservation_open_days is null;
update public.creneaux set reservation_open_time = time '08:00' where reservation_open_time is null;
update public.creneaux set reservation_close_minutes_before = 0 where reservation_close_minutes_before is null;
update public.creneaux set cancellation_deadline_hours = 2 where cancellation_deadline_hours is null;

alter table public.creneaux alter column reservation_active set default false;
alter table public.creneaux alter column reservation_open_days set default 7;
alter table public.creneaux alter column reservation_open_time set default time '08:00';
alter table public.creneaux alter column reservation_close_minutes_before set default 0;
alter table public.creneaux alter column cancellation_deadline_hours set default 2;

alter table public.creneaux drop constraint if exists creneaux_reservation_open_days_check;
alter table public.creneaux add constraint creneaux_reservation_open_days_check check (reservation_open_days >= 0 and reservation_open_days <= 90);

alter table public.creneaux drop constraint if exists creneaux_reservation_close_minutes_check;
alter table public.creneaux add constraint creneaux_reservation_close_minutes_check check (reservation_close_minutes_before >= 0 and reservation_close_minutes_before <= 10080);

alter table public.creneaux drop constraint if exists creneaux_cancellation_deadline_hours_check;
alter table public.creneaux add constraint creneaux_cancellation_deadline_hours_check check (cancellation_deadline_hours >= 0 and cancellation_deadline_hours <= 168);

alter table public.reservations add column if not exists created_at timestamptz not null default now();
alter table public.reservations add column if not exists updated_at timestamptz not null default now();

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create index if not exists reservations_creneau_date_status_idx on public.reservations(creneau_id, date_reservation, statut);

create or replace function public.log_reservation_action(
  action_name text,
  row_id_value text,
  metadata_value jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, table_name, row_id, metadata)
  values (auth.uid(), action_name, 'reservations', row_id_value, coalesce(metadata_value, '{}'::jsonb));
exception
  when undefined_table or insufficient_privilege then
    null;
end;
$$;

revoke all on function public.log_reservation_action(text, text, jsonb) from public;
grant execute on function public.log_reservation_action(text, text, jsonb) to authenticated;

drop function if exists public.list_creneaux_availability(date, date);
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
  user_reservation_id bigint,
  user_reservation_status text,
  user_waiting_status text,
  reservation_active boolean,
  reservation_open_days integer,
  reservation_open_time time,
  reservation_close_minutes_before integer,
  cancellation_deadline_hours integer,
  reservation_message text,
  opens_at timestamptz,
  closes_at timestamptz,
  cancellation_deadline_at timestamptz,
  can_reserve boolean
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
    select
      c.*,
      d.occurrence_date,
      ((d.occurrence_date + c.heure_debut) at time zone 'Europe/Paris') as occurrence_start,
      (((d.occurrence_date - coalesce(c.reservation_open_days, 7)) + coalesce(c.reservation_open_time, time '08:00')) at time zone 'Europe/Paris') as open_at
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
      select r.id
      from public.reservations r
      where r.user_id = auth.uid()
        and r.creneau_id = b.id
        and r.date_reservation = b.occurrence_date
      order by r.id desc
      limit 1
    ) as user_reservation_id,
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
    ) as user_waiting_status,
    coalesce(b.reservation_active, false) as reservation_active,
    coalesce(b.reservation_open_days, 7) as reservation_open_days,
    coalesce(b.reservation_open_time, time '08:00') as reservation_open_time,
    coalesce(b.reservation_close_minutes_before, 0) as reservation_close_minutes_before,
    coalesce(b.cancellation_deadline_hours, 2) as cancellation_deadline_hours,
    b.reservation_message,
    b.open_at as opens_at,
    b.occurrence_start - make_interval(mins => coalesce(b.reservation_close_minutes_before, 0)) as closes_at,
    b.occurrence_start - make_interval(hours => coalesce(b.cancellation_deadline_hours, 2)) as cancellation_deadline_at,
    (
      coalesce(b.reservation_active, false)
      and ca.id is null
      and now() >= b.open_at
      and now() < b.occurrence_start - make_interval(mins => coalesce(b.reservation_close_minutes_before, 0))
    ) as can_reserve
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
  profile_record public.profiles%rowtype;
  reserved_count integer;
  waiting_count integer;
  existing_reservation public.reservations%rowtype;
  existing_waiting public.waiting_list%rowtype;
  created_reservation_id bigint;
  created_waiting_id bigint;
  occurrence_start timestamptz;
  open_at timestamptz;
  close_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  select * into profile_record from public.profiles where id = auth.uid();
  if profile_record.id is null then
    raise exception 'Profil adherent introuvable';
  end if;
  if profile_record.statut is distinct from 'actif' then
    raise exception 'Compte adherent non actif';
  end if;

  select * into slot_record
  from public.creneaux
  where id = target_creneau_id
  for update;

  if slot_record.id is null or not slot_record.actif then
    raise exception 'Creneau indisponible';
  end if;
  if not coalesce(slot_record.reservation_active, false) then
    raise exception 'Reservation non active pour ce creneau';
  end if;
  if lower(slot_record.jour) <> public.french_day_for_date(target_date) then
    raise exception 'La date choisie ne correspond pas au jour du creneau';
  end if;

  occurrence_start := ((target_date + slot_record.heure_debut) at time zone 'Europe/Paris');
  open_at := (((target_date - coalesce(slot_record.reservation_open_days, 7)) + coalesce(slot_record.reservation_open_time, time '08:00')) at time zone 'Europe/Paris');
  close_at := occurrence_start - make_interval(mins => coalesce(slot_record.reservation_close_minutes_before, 0));

  if now() < open_at then
    raise exception 'Reservation pas encore ouverte';
  end if;
  if now() >= close_at then
    raise exception 'Reservation fermee pour ce creneau';
  end if;

  if exists (
    select 1 from public.creneau_annulations ca
    where ca.creneau_id = target_creneau_id
      and ca.date_reservation = target_date
  ) then
    raise exception 'Ce creneau est annule pour cette date';
  end if;

  select * into existing_reservation
  from public.reservations r
  where r.user_id = auth.uid()
    and r.creneau_id = target_creneau_id
    and r.date_reservation = target_date
    and r.statut in ('en_attente', 'confirmee')
  order by r.id desc
  limit 1;

  if existing_reservation.id is not null then
    return query
    select
      existing_reservation.statut,
      'Reservation deja enregistree.'::text,
      existing_reservation.id,
      null::bigint,
      null::integer;
    return;
  end if;

  select * into existing_waiting
  from public.waiting_list w
  where w.user_id = auth.uid()
    and w.creneau_id = target_creneau_id
    and w.date_reservation = target_date
    and w.statut in ('en_attente', 'notifiee')
  order by w.id desc
  limit 1;

  if existing_waiting.id is not null then
    return query
    select
      'liste_attente'::text,
      'Tu es deja sur la liste d''attente.'::text,
      null::bigint,
      existing_waiting.id,
      0;
    return;
  end if;

  select count(*)::int into reserved_count
  from public.reservations r
  where r.creneau_id = target_creneau_id
    and r.date_reservation = target_date
    and r.statut = 'confirmee';

  if slot_record.places_max is null or reserved_count < slot_record.places_max then
    insert into public.reservations (user_id, creneau_id, date_reservation, statut)
    values (auth.uid(), target_creneau_id, target_date, 'confirmee')
    returning id into created_reservation_id;

    perform public.log_reservation_action(
      'reservation.created',
      created_reservation_id::text,
      jsonb_build_object('creneau_id', target_creneau_id, 'date_reservation', target_date)
    );

    return query
    select
      'confirmee'::text,
      'Reservation confirmee.'::text,
      created_reservation_id,
      null::bigint,
      case when slot_record.places_max is null then null else greatest(slot_record.places_max - reserved_count - 1, 0) end;
    return;
  end if;

  insert into public.waiting_list (user_id, creneau_id, date_reservation, statut)
  values (auth.uid(), target_creneau_id, target_date, 'en_attente')
  returning id into created_waiting_id;

  select count(*)::int into waiting_count
  from public.waiting_list w
  where w.creneau_id = target_creneau_id
    and w.date_reservation = target_date
    and w.statut in ('en_attente', 'notifiee');

  perform public.log_reservation_action(
    'waiting_list.created',
    created_waiting_id::text,
    jsonb_build_object('creneau_id', target_creneau_id, 'date_reservation', target_date, 'position', waiting_count)
  );

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
  cancellation_deadline timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  select * into reservation_record
  from public.reservations
  where id = target_reservation_id
  for update;

  if reservation_record.id is null then
    raise exception 'Reservation introuvable';
  end if;
  if reservation_record.statut = 'annulee' then
    return query select 'annulee'::text, 'Reservation deja annulee.'::text, null::uuid;
    return;
  end if;

  select * into slot_record from public.creneaux where id = reservation_record.creneau_id;

  if not public.is_manager() and reservation_record.user_id <> auth.uid() then
    raise exception 'Annulation non autorisee';
  end if;

  occurrence_start := ((reservation_record.date_reservation + slot_record.heure_debut) at time zone 'Europe/Paris');
  cancellation_deadline := occurrence_start - make_interval(hours => coalesce(slot_record.cancellation_deadline_hours, 2));

  if not public.is_manager() and now() >= cancellation_deadline then
    raise exception 'Annulation impossible apres la limite configuree';
  end if;

  update public.reservations set statut = 'annulee' where id = target_reservation_id;

  perform public.log_reservation_action(
    'reservation.cancelled',
    target_reservation_id::text,
    jsonb_build_object('creneau_id', reservation_record.creneau_id, 'date_reservation', reservation_record.date_reservation)
  );

  select * into next_waiting
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

    perform public.log_reservation_action(
      'waiting_list.notified',
      next_waiting.id::text,
      jsonb_build_object('creneau_id', reservation_record.creneau_id, 'date_reservation', reservation_record.date_reservation)
    );

    return query
    select
      'annulee'::text,
      'Reservation annulee. Une personne en liste d''attente peut etre contactee.'::text,
      next_waiting.user_id;
    return;
  end if;

  return query select 'annulee'::text, 'Reservation annulee.'::text, null::uuid;
end;
$$;

revoke all on function public.cancel_reservation(bigint) from public;
grant execute on function public.cancel_reservation(bigint) to authenticated;

create or replace function public.create_creneau_cancellation(target_creneau_id bigint, target_date date, target_reason text default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  created_id bigint;
  cancelled_reservations integer;
  cancelled_waiting integer;
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  insert into public.creneau_annulations (creneau_id, date_reservation, reason, created_by)
  values (target_creneau_id, target_date, nullif(trim(coalesce(target_reason, '')), ''), auth.uid())
  on conflict (creneau_id, date_reservation)
  do update set reason = excluded.reason, updated_at = now()
  returning id into created_id;

  update public.reservations
  set statut = 'annulee'
  where creneau_id = target_creneau_id
    and date_reservation = target_date
    and statut in ('en_attente', 'confirmee');
  get diagnostics cancelled_reservations = row_count;

  update public.waiting_list
  set statut = 'annulee'
  where creneau_id = target_creneau_id
    and date_reservation = target_date
    and statut in ('en_attente', 'notifiee');
  get diagnostics cancelled_waiting = row_count;

  perform public.log_reservation_action(
    'slot_occurrence.closed',
    created_id::text,
    jsonb_build_object(
      'creneau_id', target_creneau_id,
      'date_reservation', target_date,
      'cancelled_reservations', cancelled_reservations,
      'cancelled_waiting', cancelled_waiting,
      'reason', target_reason
    )
  );

  return created_id;
end;
$$;

revoke all on function public.create_creneau_cancellation(bigint, date, text) from public;
grant execute on function public.create_creneau_cancellation(bigint, date, text) to authenticated;
