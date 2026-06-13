-- Migration ponctuelle CFVV41 : creneaux, responsable, siege social et tarifs.
-- A executer dans Supabase SQL Editor sur la base deja en ligne.

insert into public.settings_site (key, value, visibility)
values (
  'club',
  jsonb_build_object(
    'name', 'CFVV41',
    'full_name', 'Club des fous du Volant Vendomois',
    'city', 'Vendome',
    'registered_office', 'Naveil'
  ),
  'public'
)
on conflict (key) do update
set
  value = public.settings_site.value || excluded.value,
  visibility = 'public',
  updated_at = now();

-- On conserve les anciens creneaux dans la base, mais on les rend inactifs.
-- Les nouvelles lignes ci-dessous deviennent les seuls creneaux actifs.
update public.creneaux
set actif = false,
    updated_at = now();

with seed(jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable) as (
  values
    ('Mardi', '18:00'::time, '19:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeunes', 'jeunes', 'Entrainement jeunes', 28, 'Didier Remule'),
    ('Mardi', '19:30'::time, '20:45'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'entrainement', 'adultes', 'Entrainement adultes', 28, 'Didier Remule'),
    ('Mardi', '20:45'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Mercredi', '18:00'::time, '20:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Jeudi', '18:00'::time, '19:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeunes', 'jeunes', 'Entrainement jeunes', 28, 'Didier Remule'),
    ('Jeudi', '19:30'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Vendredi', '18:00'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'tous', 'Jeu libre adultes / jeunes', 28, 'Didier Remule')
)
insert into public.creneaux (jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable, actif)
select jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable, true
from seed
where not exists (
  select 1
  from public.creneaux c
  where c.jour = seed.jour
    and c.heure_debut = seed.heure_debut
    and c.heure_fin = seed.heure_fin
    and c.gymnase = seed.gymnase
);

with seed(jour, heure_debut, heure_fin, gymnase, adresse, type, public, niveau, places_max, responsable) as (
  values
    ('Mardi', '18:00'::time, '19:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeunes', 'jeunes', 'Entrainement jeunes', 28, 'Didier Remule'),
    ('Mardi', '19:30'::time, '20:45'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'entrainement', 'adultes', 'Entrainement adultes', 28, 'Didier Remule'),
    ('Mardi', '20:45'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Mercredi', '18:00'::time, '20:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Jeudi', '18:00'::time, '19:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeunes', 'jeunes', 'Entrainement jeunes', 28, 'Didier Remule'),
    ('Jeudi', '19:30'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'adultes', 'Jeu libre adultes', 28, 'Didier Remule'),
    ('Vendredi', '18:00'::time, '22:30'::time, 'Gymnase des Aigremonts', '554 Rue de la Chappe, 41100 Vendome', 'jeu_libre', 'tous', 'Jeu libre adultes / jeunes', 28, 'Didier Remule')
)
update public.creneaux c
set
  adresse = seed.adresse,
  type = seed.type,
  public = seed.public,
  niveau = seed.niveau,
  places_max = seed.places_max,
  responsable = seed.responsable,
  actif = true,
  updated_at = now()
from seed
where c.jour = seed.jour
  and c.heure_debut = seed.heure_debut
  and c.heure_fin = seed.heure_fin
  and c.gymnase = seed.gymnase;

update public.tarifs
set titre = 'Licence loisirs',
    description = 'Acces aux creneaux loisirs et jeu libre adultes.',
    montant = 60.00,
    public = 'Loisirs',
    ordre = 2,
    actif = true,
    updated_at = now()
where lower(titre) like '%loisir%'
   or lower(coalesce(public, '')) like '%loisir%'
   or lower(coalesce(public, '')) = 'adultes';

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select 'Licence loisirs', 'Acces aux creneaux loisirs et jeu libre adultes.', 60.00::numeric, 'Loisirs', 2, true
where not exists (
  select 1 from public.tarifs where lower(titre) like '%loisir%'
);

update public.tarifs
set titre = 'Licence competiteurs',
    description = 'Licence adaptee aux tournois, interclubs et creneaux competiteurs.',
    montant = 95.00,
    public = 'Competiteurs',
    ordre = 3,
    actif = true,
    updated_at = now()
where lower(titre) like '%comp%'
   or lower(coalesce(public, '')) like '%comp%';

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select 'Licence competiteurs', 'Licence adaptee aux tournois, interclubs et creneaux competiteurs.', 95.00::numeric, 'Competiteurs', 3, true
where not exists (
  select 1 from public.tarifs where lower(titre) like '%comp%'
);

update public.tarifs
set ordre = 1,
    actif = true,
    updated_at = now()
where lower(titre) like '%jeune%';

update public.tarifs
set ordre = 4,
    actif = true,
    updated_at = now()
where lower(titre) like '%essai%';
