-- Corrections issues de la revue publique CFVV.
-- Non destructif : ajoute la categorie agenda "birthday" et prepare les photos du bureau.

alter table public.events
  drop constraint if exists events_categorie_check;

alter table public.events
  add constraint events_categorie_check
  check (categorie in ('competition', 'club_event', 'meeting', 'camp', 'closure', 'birthday'));

insert into public.settings_site (key, value, visibility)
values (
  'club',
  jsonb_build_object(
    'name', 'CFVV',
    'full_name', 'Club des fous du Volants Vendômois',
    'city', 'Vendôme',
    'registered_office', '10 Imp. de la Devallerie, 41100 Naveil'
  ),
  'public'
)
on conflict (key) do update
set value = public.settings_site.value || excluded.value,
    visibility = 'public',
    updated_at = now();

insert into public.settings_site (key, value, visibility)
values (
  'contact',
  jsonb_build_object(
    'email', 'cfvv41@gmail.com',
    'phone', '06 60 93 51 85',
    'generic_contacts', 'Clovis Bellan / Didier Remule / Julie Remule',
    'facebook_url', 'https://www.facebook.com/CFVVBadminton/',
    'instagram_url', ''
  ),
  'public'
)
on conflict (key) do update
set value = public.settings_site.value || excluded.value,
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
        'role', 'Présidence',
        'name', 'Didier Remule',
        'mission', 'Coordination générale du club, relations avec les partenaires, la mairie et les instances sportives.',
        'email', '',
        'phone', '06 60 93 51 85',
        'photoUrl', '',
        'photoAlt', 'Portrait de Didier Remule'
      ),
      jsonb_build_object(
        'key', 'vice-presidence',
        'role', 'Vice-présidence',
        'name', 'Clovis Bellan',
        'mission', 'Appui à la présidence, relais du bureau et coordination des actions du club.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Clovis Bellan'
      ),
      jsonb_build_object(
        'key', 'tresorerie',
        'role', 'Trésorerie',
        'name', 'Yeliz Ozogul',
        'mission', 'Suivi du budget, cotisations, commandes et dépenses liées au fonctionnement du club.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Yeliz Ozogul'
      ),
      jsonb_build_object(
        'key', 'secretariat',
        'role', 'Secrétariat',
        'name', 'Ludovic Belhomme',
        'mission', 'Inscriptions, licences, documents administratifs et communication avec les adhérents.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Ludovic Belhomme'
      ),
      jsonb_build_object(
        'key', 'creneaux',
        'role', 'Responsables créneaux',
        'name', 'Julie Remule / Didier Remule',
        'mission', 'Accueil des joueurs, suivi des présences, annulations exceptionnelles et organisation des terrains.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait des responsables creneaux'
      ),
      jsonb_build_object(
        'key', 'communication',
        'role', 'Communication',
        'name', 'Julie Remule',
        'mission', 'Actualités, événements, informations de dernière minute et mise à jour du site.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Julie Remule'
      ),
      jsonb_build_object(
        'key', 'contact',
        'role', 'Contacts génériques',
        'name', 'Clovis Bellan / Didier Remule / Julie Remule',
        'mission', 'Référents publics pour orienter les demandes d''essai, d''inscription, de créneaux, de volants et de partenariat.',
        'email', 'cfvv41@gmail.com',
        'phone', '06 60 93 51 85',
        'photoUrl', '',
        'photoAlt', 'Referents contact du CFVV'
      ),
      jsonb_build_object(
        'key', 'benevoles',
        'role', 'Bénévoles',
        'name', 'Tous les coups de main comptent',
        'mission', 'Tournois, stages, buvette, installation, rangement et accueil des nouveaux joueurs.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Benevoles du CFVV'
      )
    )
  ),
  'public'
)
on conflict (key) do update
set value = excluded.value,
    visibility = 'public',
    updated_at = now();

update public.settings_site
set value = jsonb_set(
      value,
      '{members}',
      (
        select jsonb_agg(
          case
            when member ->> 'key' = 'presidence' then
              member
              || jsonb_build_object(
                'phone', coalesce(nullif(member ->> 'phone', ''), '06 60 93 51 85'),
                'photoUrl', coalesce(member ->> 'photoUrl', member ->> 'photo_url', ''),
                'photoAlt', coalesce(nullif(coalesce(member ->> 'photoAlt', member ->> 'photo_alt', ''), ''), 'Portrait de Didier Remule')
              )
            else
              member
              || jsonb_build_object(
                'photoUrl', coalesce(member ->> 'photoUrl', member ->> 'photo_url', ''),
                'photoAlt', coalesce(
                  nullif(coalesce(member ->> 'photoAlt', member ->> 'photo_alt', ''), ''),
                  'Portrait de ' || coalesce(nullif(member ->> 'name', ''), 'membre du bureau')
                )
              )
          end
          order by ordinality
        )
        from jsonb_array_elements(value -> 'members') with ordinality as e(member, ordinality)
      ),
      true
    ),
    updated_at = now()
where key = 'bureau'
  and jsonb_typeof(value -> 'members') = 'array';
