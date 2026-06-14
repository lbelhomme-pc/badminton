-- Parametres publics administrables CF2V41 : bureau, contact et siege social.
-- A executer dans l'editeur SQL Supabase pour alimenter la page admin Parametres.

insert into public.settings_site (key, value, visibility)
values (
  'club',
  jsonb_build_object(
    'name', 'CF2V41',
    'full_name', 'Club des fous du Volant Vendomois',
    'city', 'Vendome',
    'registered_office', 'Naveil',
    'ffbad_url', ''
  ),
  'public'
)
on conflict (key) do update
set
  value = public.settings_site.value || excluded.value,
  visibility = 'public',
  updated_at = now();

insert into public.settings_site (key, value, visibility)
values (
  'contact',
  jsonb_build_object(
    'email', 'cfvv41@gmail.com',
    'phone', '',
    'facebook_url', '',
    'instagram_url', ''
  ),
  'public'
)
on conflict (key) do update
set
  value = public.settings_site.value || excluded.value,
  visibility = 'public',
  updated_at = now();

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
        'name', 'Didier Remule',
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
  visibility = 'public',
  updated_at = now();
