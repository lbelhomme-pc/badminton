-- Les créneaux du mercredi et du vendredi sont réservables en ligne.
-- Cette migration corrige aussi les bases où ces jours avaient déjà été mis à false.

update public.creneaux
set
  reservation_active = true,
  reservation_message = coalesce(
    nullif(reservation_message, ''),
    'Créneau réservable en ligne pour mieux organiser la présence des joueurs.'
  )
where lower(jour) in ('mercredi', 'vendredi');

update public.actualites
set contenu = replace(
  contenu,
  'avec 28 places disponibles par creneau',
  'avec des seances reservables le mercredi et le vendredi'
)
where contenu ilike '%28 places disponibles%';
