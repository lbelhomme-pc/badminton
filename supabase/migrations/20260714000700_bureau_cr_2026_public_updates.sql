-- Public updates from the CFVV bureau report dated 2026-07-03.
-- Internal finance, bank, PV and non-validated governance details are intentionally not published.

update public.creneaux
set
  responsable = 'Julie Remule / Didier Remule',
  reservation_active = true,
  reservation_message = 'Reservation recommandee pour verifier qu''il y a assez de joueurs sur ce creneau.'
where lower(jour) in ('mercredi', 'vendredi');

update public.creneaux
set
  responsable = 'Clovis / Gildas',
  reservation_active = false
where lower(jour) = 'jeudi';

update public.creneaux
set
  reservation_active = false,
  reservation_message = coalesce(reservation_message, 'Organisation du mardi a confirmer selon les inscriptions jeunes.')
where lower(jour) = 'mardi';

update public.tarifs
set actif = false
where lower(titre) in (
  'licence loisirs',
  'licence competiteurs',
  'licence enfants loisirs',
  'licence enfants competiteurs'
);

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select
  'Licence jeunes',
  'Tarif propose pour la saison 2026/2027, a confirmer lors de l''ouverture des inscriptions Poona.',
  90,
  'Jeunes',
  1,
  true
where not exists (select 1 from public.tarifs where lower(titre) = 'licence jeunes');

update public.tarifs
set
  description = 'Tarif propose pour la saison 2026/2027, a confirmer lors de l''ouverture des inscriptions Poona.',
  montant = 90,
  public = 'Jeunes',
  ordre = 1,
  actif = true
where lower(titre) = 'licence jeunes';

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select
  'Licence adultes',
  'Tarif propose pour la saison 2026/2027, a confirmer lors de l''ouverture des inscriptions Poona.',
  100,
  'Adultes',
  2,
  true
where not exists (select 1 from public.tarifs where lower(titre) = 'licence adultes');

update public.tarifs
set
  description = 'Tarif propose pour la saison 2026/2027, a confirmer lors de l''ouverture des inscriptions Poona.',
  montant = 100,
  public = 'Adultes',
  ordre = 2,
  actif = true
where lower(titre) = 'licence adultes';

update public.tarifs
set
  description = 'Jusqu''a 3 seances d''essai gratuites pour decouvrir le club avant inscription.',
  montant = 0,
  public = 'Decouverte',
  ordre = 3,
  actif = true
where lower(titre) = 'essai';

update public.volants
set
  marque = 'RSL',
  modele = 'Rouges',
  type = 'plume',
  prix = 25,
  stock = coalesce(stock, 0),
  disponibilite = case when coalesce(stock, 0) > 0 then 'disponible' else 'indisponible' end,
  actif = true
where lower(marque) = 'rsl'
  and (
    lower(coalesce(modele, '')) like '%grade 3%'
    or lower(coalesce(modele, '')) like '%rouge%'
  );

insert into public.volants (
  marque,
  modele,
  type,
  prix,
  stock,
  actif,
  reference,
  quantite_boite,
  disponibilite,
  limite_commande,
  instructions_retrait,
  payment_provider
)
select
  'RSL',
  'Rouges',
  'plume',
  25,
  0,
  true,
  'RSL-ROUGES-2026',
  1,
  'indisponible',
  4,
  'Retrait a organiser avec le responsable volants a la salle.',
  'helloasso'
where not exists (
  select 1 from public.volants
  where lower(marque) = 'rsl' and lower(coalesce(modele, '')) = 'rouges'
);

update public.volants
set actif = false
where lower(marque) = 'rsl'
  and lower(coalesce(modele, '')) like '%training a9%';

insert into public.volants (
  marque,
  modele,
  type,
  prix,
  stock,
  actif,
  reference,
  quantite_boite,
  disponibilite,
  limite_commande,
  instructions_retrait,
  payment_provider
)
select
  'Forza',
  'Hybride',
  'hybride',
  16,
  0,
  true,
  'FORZA-HYBRIDE-2026',
  1,
  'indisponible',
  4,
  'Retrait a organiser avec le responsable volants a la salle.',
  'helloasso'
where not exists (
  select 1 from public.volants
  where lower(marque) = 'forza' and lower(coalesce(modele, '')) = 'hybride'
);

update public.events
set
  titre = 'Journee des associations',
  description = 'Le CFVV sera present pour presenter les creneaux, les inscriptions et les informations de rentree. Creneaux jeunes a demander directement sur le stand.',
  categorie = 'club_event',
  statut = 'published',
  starts_at = '2026-09-05 09:00:00+02',
  ends_at = '2026-09-05 18:00:00+02',
  lieu = 'Stand du club, lieu communique par l''USV',
  public_cible = 'Tous publics',
  contact_label = 'Contacter le club',
  contact_href = '/contact',
  visible_public = true,
  published_at = coalesce(published_at, '2026-07-03 20:00:00+02')
where slug = 'journee-associations-2026';

insert into public.events (
  slug,
  titre,
  description,
  categorie,
  statut,
  starts_at,
  ends_at,
  lieu,
  public_cible,
  contact_label,
  contact_href,
  visible_public,
  published_at
)
select
  'journee-associations-2026',
  'Journee des associations',
  'Le CFVV sera present pour presenter les creneaux, les inscriptions et les informations de rentree. Creneaux jeunes a demander directement sur le stand.',
  'club_event',
  'published',
  '2026-09-05 09:00:00+02',
  '2026-09-05 18:00:00+02',
  'Stand du club, lieu communique par l''USV',
  'Tous publics',
  'Contacter le club',
  '/contact',
  true,
  '2026-07-03 20:00:00+02'
where not exists (select 1 from public.events where slug = 'journee-associations-2026');

insert into public.events (
  slug,
  titre,
  description,
  categorie,
  statut,
  starts_at,
  lieu,
  public_cible,
  contact_label,
  contact_href,
  visible_public,
  published_at
)
select
  'apres-midi-bienvenue-2026',
  'Apres-midi de bienvenue',
  'Temps convivial de debut de saison. Le lieu reste a confirmer entre Laser Game, Cabane a Mousse ou Padel Arena. Les inscriptions seront organisees via le site.',
  'club_event',
  'published',
  '2026-10-03 14:00:00+02',
  'Lieu a definir',
  'Adherents et nouveaux joueurs',
  'Suivre les infos',
  '/agenda',
  true,
  '2026-07-03 20:00:00+02'
where not exists (select 1 from public.events where slug = 'apres-midi-bienvenue-2026');

insert into public.events (
  slug,
  titre,
  description,
  categorie,
  statut,
  starts_at,
  lieu,
  public_cible,
  contact_label,
  contact_href,
  visible_public,
  published_at
)
select
  'tournoi-interne-costume-2026',
  'Tournoi interne costume',
  'Tournoi interne du club avec deguisements. Lot prevu pour le meilleur deguisement et le vainqueur du tournoi.',
  'club_event',
  'published',
  '2026-11-06 20:00:00+02',
  'Gymnase des Aigremonts',
  'Adherents',
  'Voir les creneaux',
  '/creneaux',
  true,
  '2026-07-03 20:00:00+02'
where not exists (select 1 from public.events where slug = 'tournoi-interne-costume-2026');

insert into public.events (
  slug,
  titre,
  description,
  categorie,
  statut,
  starts_at,
  lieu,
  public_cible,
  visible_public,
  published_at
)
select
  'tournoi-ouvert-hiver-2026',
  'Tournoi ouvert a tous',
  'Projet de tournoi ouvert, entree envisagee a 5 euros par joueur. Date a arbitrer entre le 18 decembre 2026 et le 8 janvier 2027.',
  'competition',
  'draft',
  '2026-12-18 20:00:00+02',
  'Lieu a confirmer',
  'Tous publics',
  false,
  '2026-07-03 20:00:00+02'
where not exists (select 1 from public.events where slug = 'tournoi-ouvert-hiver-2026');

insert into public.actualites (titre, contenu, visible_public, published_at, statut)
select
  'Tarifs 2026/2027 proposes',
  'Le bureau propose pour la saison 2026/2027 une licence jeunes a 90 euros et une licence adultes a 100 euros. Les inscriptions en ligne via Poona sont visees a partir du 1er aout 2026.',
  true,
  '2026-07-03 20:00:00+02',
  'publie'
where not exists (
  select 1 from public.actualites
  where lower(titre) = 'tarifs 2026/2027 proposes'
);

insert into public.actualites (titre, contenu, visible_public, published_at, statut)
select
  'Journee des associations le 5 septembre',
  'Le CFVV prepare son stand pour la Journee des associations du 5 septembre 2026. L''objectif est de presenter les creneaux, les inscriptions et les informations de rentree aux futurs adherents.',
  true,
  '2026-07-03 20:00:00+02',
  'publie'
where not exists (
  select 1 from public.actualites
  where lower(titre) = 'journee des associations le 5 septembre'
);

insert into public.actualites (titre, contenu, visible_public, published_at, statut)
select
  'Reprise et creneaux ete',
  'Les creneaux d''ete sont ouverts jusqu''au 17 juillet 2026. La reprise est prevue le 17 aout 2026, sous reserve de confirmation des disponibilites de gymnase.',
  true,
  '2026-07-03 20:00:00+02',
  'publie'
where not exists (
  select 1 from public.actualites
  where lower(titre) = 'reprise et creneaux ete'
);
