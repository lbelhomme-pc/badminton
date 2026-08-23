-- Corrige les contenus publics historiques enregistrés sans accents.

do $$
begin

update public.creneaux
set reservation_message = 'Réservation recommandée pour vérifier qu''il y a assez de joueurs sur ce créneau.'
where lower(jour) in ('mercredi', 'vendredi');

update public.creneaux
set reservation_message = 'Organisation du mardi à confirmer selon les inscriptions jeunes.'
where lower(jour) = 'mardi'
  and reservation_message is not null;

update public.tarifs
set description = 'Tarif proposé pour la saison 2026/2027, à confirmer lors de l''ouverture des inscriptions Poona.'
where lower(titre) in ('licence jeunes', 'licence adultes');

update public.tarifs
set
  description = 'Jusqu''à 3 séances d''essai gratuites pour découvrir le club avant inscription.',
  public = 'Découverte'
where lower(titre) = 'essai';

update public.volants
set instructions_retrait = 'Retrait à organiser avec le responsable volants à la salle.'
where lower(marque) in ('rsl', 'forza');

update public.events
set
  titre = 'Journée des associations',
  description = 'Le CFVV sera présent pour présenter les créneaux, les inscriptions et les informations de rentrée. Créneaux jeunes à demander directement sur le stand.',
  lieu = 'Stand du club, lieu communiqué par l''USV',
  public_cible = 'Tous publics',
  contact_label = 'Contacter le club'
where slug = 'journee-associations-2026';

update public.events
set
  titre = 'Après-midi de bienvenue',
  description = 'Temps convivial de début de saison. Le lieu reste à confirmer entre Laser Game, Cabane à Mousse ou Padel Arena. Les inscriptions seront organisées via le site.',
  lieu = 'Lieu à définir',
  public_cible = 'Adhérents et nouveaux joueurs',
  contact_label = 'Suivre les informations'
where slug = 'apres-midi-bienvenue-2026';

update public.events
set
  titre = 'Tournoi interne costumé',
  description = 'Tournoi interne du club avec déguisements. Lot prévu pour le meilleur déguisement et le vainqueur du tournoi.',
  public_cible = 'Adhérents',
  contact_label = 'Voir les créneaux'
where slug = 'tournoi-interne-costume-2026';

update public.events
set
  titre = 'Tournoi ouvert à tous',
  description = 'Projet de tournoi ouvert, entrée envisagée à 5 euros par joueur. Date à arbitrer entre le 18 décembre 2026 et le 8 janvier 2027.',
  lieu = 'Lieu à confirmer'
where slug = 'tournoi-ouvert-hiver-2026';

update public.actualites
set
  titre = 'Tarifs 2026/2027 proposés',
  contenu = 'Le bureau propose pour la saison 2026/2027 une licence jeunes à 90 euros et une licence adultes à 100 euros. Les inscriptions en ligne via Poona sont visées à partir du 1er août 2026.'
where lower(titre) in ('tarifs 2026/2027 proposes', 'tarifs 2026/2027 proposés');

update public.actualites
set
  titre = 'Journée des associations le 5 septembre',
  contenu = 'Le CFVV prépare son stand pour la Journée des associations du 5 septembre 2026. L''objectif est de présenter les créneaux, les inscriptions et les informations de rentrée aux futurs adhérents.'
where lower(titre) in ('journee des associations le 5 septembre', 'journée des associations le 5 septembre');

update public.actualites
set
  titre = 'Reprise et créneaux d''été',
  contenu = 'Les créneaux d''été sont ouverts jusqu''au 17 juillet 2026. La reprise est prévue le 17 août 2026, sous réserve de confirmation des disponibilités du gymnase.'
where lower(titre) in ('reprise et creneaux ete', 'reprise et créneaux été', 'reprise et créneaux d''été');

end
$$;
