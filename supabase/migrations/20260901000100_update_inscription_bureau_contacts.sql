-- Mise à jour des consignes d'inscription et des membres publics du bureau.
-- Migration idempotente : les membres sont ajoutés uniquement si leur clé n'existe pas.

update public.settings_site
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{generic_contacts}',
  to_jsonb(''::text),
  true
),
visibility = 'public'
where key = 'contact';

insert into public.settings_site (key, value, visibility)
values ('contact', jsonb_build_object('generic_contacts', ''), 'public')
on conflict (key) do nothing;

-- Le bloc "Contacts génériques" ne doit plus afficher les trois anciens référents.
-- On conserve la fiche de contact dans la page Bureau, sous un nom collectif.
update public.settings_site
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{members}',
  (
    select coalesce(
      jsonb_agg(
        case
          when member ->> 'key' = 'contact' then member || jsonb_build_object(
            'name', 'Bureau du CFVV',
            'photoAlt', 'Contacts du bureau du CFVV'
          )
          else member
        end
        order by ordinal
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(value -> 'members', '[]'::jsonb)) with ordinality as members(member, ordinal)
  ),
  true
)
where key = 'bureau';

update public.settings_site
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{members}',
  coalesce(value -> 'members', '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'key', 'membre-sebastien',
      'role', 'Membre du bureau',
      'name', 'Sébastien',
      'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
      'email', '',
      'phone', '',
      'photoUrl', '',
      'photoAlt', 'Portrait de Sébastien'
    )
  ),
  true
)
where key = 'bureau'
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(value -> 'members', '[]'::jsonb)) as member
    where member ->> 'key' = 'membre-sebastien'
  );

update public.settings_site
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{members}',
  coalesce(value -> 'members', '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'key', 'membre-geoffray',
      'role', 'Membre du bureau',
      'name', 'Geoffray Erny',
      'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
      'email', '',
      'phone', '',
      'photoUrl', '',
      'photoAlt', 'Portrait de Geoffray Erny'
    )
  ),
  true
)
where key = 'bureau'
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(value -> 'members', '[]'::jsonb)) as member
    where member ->> 'key' = 'membre-geoffray'
  );

update public.settings_site
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{members}',
  coalesce(value -> 'members', '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'key', 'membre-emilie',
      'role', 'Membre du bureau',
      'name', 'Emilie Gauvry',
      'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
      'email', '',
      'phone', '',
      'photoUrl', '',
      'photoAlt', 'Portrait d''Emilie Gauvry'
    )
  ),
  true
)
where key = 'bureau'
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(value -> 'members', '[]'::jsonb)) as member
    where member ->> 'key' = 'membre-emilie'
  );

insert into public.settings_site (key, value, visibility)
values (
  'bureau',
  jsonb_build_object(
    'members', jsonb_build_array(
      jsonb_build_object(
        'key', 'membre-sebastien',
        'role', 'Membre du bureau',
        'name', 'Sébastien',
        'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Sébastien'
      ),
      jsonb_build_object(
        'key', 'membre-geoffray',
        'role', 'Membre du bureau',
        'name', 'Geoffray Erny',
        'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait de Geoffray Erny'
      ),
      jsonb_build_object(
        'key', 'membre-emilie',
        'role', 'Membre du bureau',
        'name', 'Emilie Gauvry',
        'mission', 'Participation à la vie du club, à l''accueil des joueurs et aux actions du bureau.',
        'email', '',
        'phone', '',
        'photoUrl', '',
        'photoAlt', 'Portrait d''Emilie Gauvry'
      )
    )
  ),
  'public'
)
on conflict (key) do nothing;
