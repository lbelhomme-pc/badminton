-- Official public identity and contact details confirmed by the club.

insert into public.settings_site (key, value, visibility)
values (
  'club',
  jsonb_build_object(
    'name', 'CFVV',
    'full_name', 'Club des fous du Volants Vendomois',
    'city', 'Vendome',
    'registered_office', '10 Imp. de la Devallerie, 41100 Naveil'
  ),
  'public'
)
on conflict (key) do update
set
  value = public.settings_site.value || excluded.value,
  visibility = excluded.visibility;

insert into public.settings_site (key, value, visibility)
values (
  'contact',
  jsonb_build_object(
    'email', 'cfvv41@gmail.com',
    'phone', '06 60 93 51 85',
    'generic_contacts', 'Clovis Bellan / Didier Remule / Julie Remule',
    'facebook_url', '',
    'instagram_url', ''
  ),
  'public'
)
on conflict (key) do update
set
  value = public.settings_site.value || excluded.value,
  visibility = excluded.visibility;

insert into public.settings_site (key, value, visibility)
values (
  'bureau',
  jsonb_build_object(
    'members',
    jsonb_build_array(
      jsonb_build_object(
        'key', 'presidence',
        'role', 'Presidence',
        'name', 'Didier Remule',
        'mission', 'Coordination generale du club, relations avec les partenaires, la mairie et les instances sportives.',
        'email', '',
        'phone', ''
      ),
      jsonb_build_object(
        'key', 'tresorerie',
        'role', 'Tresorerie',
        'name', 'Yeliz Ozogul',
        'mission', 'Suivi du budget, cotisations, commandes et depenses liees au fonctionnement du club.',
        'email', '',
        'phone', ''
      ),
      jsonb_build_object(
        'key', 'secretariat',
        'role', 'Secretariat',
        'name', 'Ludovic Belhomme',
        'mission', 'Inscriptions, licences, documents administratifs et communication avec les adherents.',
        'email', '',
        'phone', ''
      ),
      jsonb_build_object(
        'key', 'creneaux',
        'role', 'Responsables creneaux',
        'name', 'Julie Remule / Didier Remule',
        'mission', 'Accueil des joueurs, suivi des presences, annulations exceptionnelles et organisation des terrains.',
        'email', '',
        'phone', ''
      ),
      jsonb_build_object(
        'key', 'communication',
        'role', 'Communication',
        'name', 'Julie Remule',
        'mission', 'Actualites, evenements, informations de derniere minute et mise a jour du site.',
        'email', '',
        'phone', ''
      ),
      jsonb_build_object(
        'key', 'contact',
        'role', 'Contacts generiques',
        'name', 'Clovis Bellan / Didier Remule / Julie Remule',
        'mission', 'Referents publics pour orienter les demandes d''essai, d''inscription, de creneaux, de volants et de partenariat.',
        'email', 'cfvv41@gmail.com',
        'phone', '06 60 93 51 85'
      ),
      jsonb_build_object(
        'key', 'benevoles',
        'role', 'Benevoles',
        'name', 'Tous les coups de main comptent',
        'mission', 'Tournois, stages, buvette, installation, rangement et accueil des nouveaux joueurs.',
        'email', '',
        'phone', ''
      )
    )
  ),
  'public'
)
on conflict (key) do update
set
  value = excluded.value,
  visibility = excluded.visibility;
