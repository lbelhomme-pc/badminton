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
      select r.id
      from public.reservations r
      where r.user_id = auth.uid()
        and r.creneau_id = b.id
        and r.date_reservation = b.occurrence_date
        and r.statut not in ('annulee', 'refusee')
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
    ) as user_waiting_status
  from base b
  left join reservation_counts rc on rc.creneau_id = b.id and rc.date_reservation = b.occurrence_date
  left join waiting_counts wc on wc.creneau_id = b.id and wc.date_reservation = b.occurrence_date
  left join public.creneau_annulations ca on ca.creneau_id = b.id and ca.date_reservation = b.occurrence_date
  order by b.occurrence_date, b.heure_debut;
$$;

revoke all on function public.list_creneaux_availability(date, date) from public;
grant execute on function public.list_creneaux_availability(date, date) to anon, authenticated;
