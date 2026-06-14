-- Mise a jour CF2V41 : email de contact et tarifs enfants.
-- A executer dans l'editeur SQL Supabase sur la base en ligne.

insert into public.settings_site (key, value, visibility)
values (
  'club',
  jsonb_build_object(
    'name', 'CF2V41',
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

update public.tarifs
set actif = false,
    updated_at = now()
where lower(titre) = 'jeunes';

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select 'Licence enfants loisirs', 'Licence jeune pour jouer en loisir sur les creneaux adaptes.', 50.00, 'Jeunes', 1, true
where not exists (
  select 1 from public.tarifs where lower(titre) = 'licence enfants loisirs'
);

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select 'Licence enfants competiteurs', 'Licence jeune pour les enfants qui participent aux competitions.', 85.00, 'Jeunes competiteurs', 2, true
where not exists (
  select 1 from public.tarifs where lower(titre) = 'licence enfants competiteurs'
);

update public.tarifs
set description = 'Licence jeune pour jouer en loisir sur les creneaux adaptes.',
    montant = 50.00,
    public = 'Jeunes',
    ordre = 1,
    actif = true,
    updated_at = now()
where lower(titre) = 'licence enfants loisirs';

update public.tarifs
set description = 'Licence jeune pour les enfants qui participent aux competitions.',
    montant = 85.00,
    public = 'Jeunes competiteurs',
    ordre = 2,
    actif = true,
    updated_at = now()
where lower(titre) = 'licence enfants competiteurs';

update public.tarifs
set ordre = 3,
    updated_at = now()
where lower(titre) = 'licence loisirs';

update public.tarifs
set ordre = 4,
    updated_at = now()
where lower(titre) = 'licence competiteurs';

update public.tarifs
set ordre = 5,
    updated_at = now()
where lower(titre) = 'essai';

update public.actualites
set contenu = 'Adultes : loisirs 60 euros, competiteurs 95 euros. Enfants : loisirs 50 euros, competiteurs 85 euros.',
    updated_at = now()
where lower(titre) = 'tarifs licences';
