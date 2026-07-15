-- Activation de compte par numero de licence FFBaD.
-- Le CSV transmis contient : Nom;Prenom;Licence;Categorie.

create table if not exists public.member_licences (
  id uuid primary key default gen_random_uuid(),
  licence_ffbad text not null,
  prenom text not null default '',
  nom text not null default '',
  categorie text,
  statut text not null default 'actif',
  role text not null default 'adherent',
  roles public.app_role[] not null default array['member']::public.app_role[],
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_email text,
  claimed_at timestamptz,
  source text not null default 'admin',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_licences_statut_check check (statut in ('actif', 'inactif', 'archive')),
  constraint member_licences_role_check check (role in ('adherent', 'entraineur', 'bureau', 'admin')),
  constraint member_licences_licence_not_blank check (btrim(licence_ffbad) <> '')
);

alter table public.member_licences add column if not exists licence_ffbad text;
alter table public.member_licences add column if not exists prenom text;
alter table public.member_licences add column if not exists nom text;
alter table public.member_licences add column if not exists categorie text;
alter table public.member_licences add column if not exists statut text;
alter table public.member_licences add column if not exists role text;
alter table public.member_licences add column if not exists roles public.app_role[];
alter table public.member_licences add column if not exists claimed_by uuid references auth.users(id) on delete set null;
alter table public.member_licences add column if not exists claimed_email text;
alter table public.member_licences add column if not exists claimed_at timestamptz;
alter table public.member_licences add column if not exists source text;
alter table public.member_licences add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.member_licences add column if not exists created_at timestamptz;
alter table public.member_licences add column if not exists updated_at timestamptz;

update public.member_licences set prenom = '' where prenom is null;
update public.member_licences set nom = '' where nom is null;
update public.member_licences set statut = 'actif' where statut is null;
update public.member_licences set role = 'adherent' where role is null;
update public.member_licences set roles = array['member']::public.app_role[] where roles is null;
update public.member_licences set source = 'admin' where source is null;
update public.member_licences set created_at = now() where created_at is null;
update public.member_licences set updated_at = now() where updated_at is null;

alter table public.member_licences alter column prenom set default '';
alter table public.member_licences alter column nom set default '';
alter table public.member_licences alter column statut set default 'actif';
alter table public.member_licences alter column role set default 'adherent';
alter table public.member_licences alter column roles set default array['member']::public.app_role[];
alter table public.member_licences alter column source set default 'admin';
alter table public.member_licences alter column created_at set default now();
alter table public.member_licences alter column updated_at set default now();

alter table public.member_licences alter column licence_ffbad set not null;
alter table public.member_licences alter column prenom set not null;
alter table public.member_licences alter column nom set not null;
alter table public.member_licences alter column statut set not null;
alter table public.member_licences alter column role set not null;
alter table public.member_licences alter column roles set not null;
alter table public.member_licences alter column source set not null;
alter table public.member_licences alter column created_at set not null;
alter table public.member_licences alter column updated_at set not null;

create unique index if not exists member_licences_licence_ffbad_unique_idx
on public.member_licences(licence_ffbad);

create index if not exists member_licences_claimed_by_idx on public.member_licences(claimed_by);
create index if not exists member_licences_statut_idx on public.member_licences(statut);
create index if not exists member_licences_nom_idx on public.member_licences(nom);

create unique index if not exists profiles_licence_ffbad_unique_idx
on public.profiles(licence_ffbad)
where licence_ffbad is not null and btrim(licence_ffbad) <> '';

drop trigger if exists member_licences_set_updated_at on public.member_licences;
create trigger member_licences_set_updated_at
before update on public.member_licences
for each row execute function public.set_updated_at();

alter table public.member_licences enable row level security;

drop policy if exists "member_licences_admin_select" on public.member_licences;
create policy "member_licences_admin_select"
on public.member_licences
for select
using (public.is_admin());

drop policy if exists "member_licences_admin_insert" on public.member_licences;
create policy "member_licences_admin_insert"
on public.member_licences
for insert
with check (public.is_admin());

drop policy if exists "member_licences_admin_update" on public.member_licences;
create policy "member_licences_admin_update"
on public.member_licences
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "member_licences_admin_delete" on public.member_licences;
create policy "member_licences_admin_delete"
on public.member_licences
for delete
using (public.is_admin());

create or replace function public.lookup_member_licence(target_licence text)
returns table (
  is_found boolean,
  available boolean,
  licence_ffbad text,
  prenom text,
  nom text,
  categorie text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_licence text := nullif(btrim(target_licence), '');
  licence_row public.member_licences%rowtype;
begin
  if clean_licence is null then
    return query select false, false, null::text, null::text, null::text, null::text, 'Indique un numero de licence FFBaD.'::text;
    return;
  end if;

  select *
  into licence_row
  from public.member_licences ml
  where ml.licence_ffbad = clean_licence
    and ml.statut = 'actif'
  limit 1;

  if not found then
    return query select false, false, clean_licence, null::text, null::text, null::text, 'Ce numero de licence n''est pas reconnu comme actif par le club.'::text;
    return;
  end if;

  return query
    select
      true,
      licence_row.claimed_by is null,
      licence_row.licence_ffbad,
      licence_row.prenom,
      licence_row.nom,
      licence_row.categorie,
      case
        when licence_row.claimed_by is null then 'Licence reconnue. Tu peux creer ton compte adherent.'
        else 'Cette licence est deja rattachee a un compte.'
      end;
end;
$$;

revoke all on function public.lookup_member_licence(text) from public;
grant execute on function public.lookup_member_licence(text) to anon;
grant execute on function public.lookup_member_licence(text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  licence text := nullif(btrim(new.raw_user_meta_data ->> 'licence_ffbad'), '');
  licence_row public.member_licences%rowtype;
  next_prenom text;
  next_nom text;
  next_categorie text;
begin
  if licence is not null then
    select *
    into licence_row
    from public.member_licences ml
    where ml.licence_ffbad = licence
      and ml.statut = 'actif'
    for update;

    if not found then
      raise exception 'licence_ffbad inconnue ou inactive';
    end if;

    if licence_row.claimed_by is not null and licence_row.claimed_by <> new.id then
      raise exception 'licence_ffbad deja rattachee a un compte';
    end if;
  end if;

  next_prenom := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'prenom'), ''), licence_row.prenom, '');
  next_nom := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nom'), ''), licence_row.nom, '');
  next_categorie := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'categorie'), ''), licence_row.categorie);

  insert into public.profiles (id, email, prenom, nom, telephone, categorie, licence_ffbad, statut)
  values (
    new.id,
    new.email,
    next_prenom,
    next_nom,
    coalesce(new.raw_user_meta_data ->> 'telephone', ''),
    next_categorie,
    licence,
    'actif'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    prenom = coalesce(nullif(public.profiles.prenom, ''), excluded.prenom),
    nom = coalesce(nullif(public.profiles.nom, ''), excluded.nom),
    telephone = coalesce(nullif(public.profiles.telephone, ''), excluded.telephone),
    categorie = coalesce(public.profiles.categorie, excluded.categorie),
    licence_ffbad = coalesce(public.profiles.licence_ffbad, excluded.licence_ffbad);

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  if licence is not null then
    update public.member_licences
    set
      claimed_by = new.id,
      claimed_email = new.email,
      claimed_at = coalesce(claimed_at, now())
    where licence_ffbad = licence
      and (claimed_by is null or claimed_by = new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.member_licences (licence_ffbad, prenom, nom, categorie, statut, source)
values
  ('07172923', 'Pauline', 'AUBRY', 'Veteran 1', 'actif', 'csv_initial'),
  ('07705663', 'Kévin', 'AUTRIVE', 'Senior', 'actif', 'csv_initial'),
  ('07388524', 'Agathe', 'BEAUGENDRE', 'Senior', 'actif', 'csv_initial'),
  ('07480236', 'Ludovic', 'BELHOMME', 'Senior', 'actif', 'csv_initial'),
  ('07667254', 'Clovis', 'BELLAN', 'Senior', 'actif', 'csv_initial'),
  ('07698143', 'Dylan', 'BILLARDON', 'Senior', 'actif', 'csv_initial'),
  ('07719108', 'Lilou', 'BOURDON', 'Senior', 'actif', 'csv_initial'),
  ('07678958', 'Lila', 'BOURGON', 'Senior', 'actif', 'csv_initial'),
  ('07559028', 'Jérémy', 'BOUTET', 'Senior', 'actif', 'csv_initial'),
  ('07724719', 'Yael', 'BRANDT', 'Junior 1', 'actif', 'csv_initial'),
  ('07719099', 'Valentin', 'BREBION-DESTREE', 'Junior 1', 'actif', 'csv_initial'),
  ('06596414', 'Christophe', 'BROUARD', 'Veteran 2', 'actif', 'csv_initial'),
  ('07549461', 'Solène', 'CANCY', 'Senior', 'actif', 'csv_initial'),
  ('07702794', 'Valentin', 'CAPLANNE', 'Junior 1', 'actif', 'csv_initial'),
  ('07283923', 'Maxime', 'CARRILLAT', 'Junior 1', 'actif', 'csv_initial'),
  ('07077058', 'Zakaria', 'CHALLOUH', 'Senior', 'actif', 'csv_initial'),
  ('06912803', 'Jeremy', 'CHERON', 'Senior', 'actif', 'csv_initial'),
  ('07165502', 'Yann', 'CHERON', 'Junior 1', 'actif', 'csv_initial'),
  ('06630654', 'Gabriel', 'COME', 'Senior', 'actif', 'csv_initial'),
  ('07702831', 'Tom', 'CORBIN', 'Cadet 1', 'actif', 'csv_initial'),
  ('07610150', 'Theo', 'CORNILLON', 'Minime 2', 'actif', 'csv_initial'),
  ('07655526', 'Mellissa', 'DAVID', 'Benjamin 2', 'actif', 'csv_initial'),
  ('00459744', 'Véronique', 'DAVID', 'Veteran 3', 'actif', 'csv_initial'),
  ('07539994', 'Luc', 'DEMOL', 'Senior', 'actif', 'csv_initial'),
  ('00516547', 'Louis', 'DEMOULIN', 'Senior', 'actif', 'csv_initial'),
  ('06488722', 'Gildas', 'DENIAU', 'Veteran 3', 'actif', 'csv_initial'),
  ('07461749', 'Arnaud', 'DILIGEART', 'Senior', 'actif', 'csv_initial'),
  ('06902422', 'Maxime', 'DUGUE', 'Veteran 1', 'actif', 'csv_initial'),
  ('07719111', 'Mathis', 'DUVIGNEAU', 'Cadet 1', 'actif', 'csv_initial'),
  ('00296534', 'Geoffray', 'ERNY', 'Veteran 3', 'actif', 'csv_initial'),
  ('07724720', 'Samuel', 'GALMICHE', 'Minime 1', 'actif', 'csv_initial'),
  ('07730120', 'Romane', 'GAURAT', 'Senior', 'actif', 'csv_initial'),
  ('07724717', 'Elikya', 'GAUTIER', 'Cadet 1', 'actif', 'csv_initial'),
  ('07567104', 'émilie', 'GAUVRY', 'Senior', 'actif', 'csv_initial'),
  ('07734252', 'Sébastien', 'GIBIER', 'Senior', 'actif', 'csv_initial'),
  ('00352879', 'Guillaume', 'GIRARD', 'Veteran 2', 'actif', 'csv_initial'),
  ('07549961', 'Alban', 'GIRODON', 'Minime 1', 'actif', 'csv_initial'),
  ('06792561', 'Thibault', 'GOSSEAUME', 'Veteran 1', 'actif', 'csv_initial'),
  ('07243948', 'Audrey', 'GUIMARD', 'Veteran 1', 'actif', 'csv_initial'),
  ('07649827', 'Maxime', 'GUYON', 'Veteran 2', 'actif', 'csv_initial'),
  ('07732119', 'Rayan', 'HAMDAOUI', 'Benjamin 1', 'actif', 'csv_initial'),
  ('07732117', 'Romain', 'HUET', 'Veteran 1', 'actif', 'csv_initial'),
  ('07609664', 'Valérie', 'INFELICE', 'Veteran 2', 'actif', 'csv_initial'),
  ('07734250', 'Marc', 'JONOT', 'Senior', 'actif', 'csv_initial'),
  ('07730117', 'Lola', 'LAAJILI', 'Cadet 1', 'actif', 'csv_initial'),
  ('07655530', 'Emma', 'LANGOILE', 'Junior 2', 'actif', 'csv_initial'),
  ('07655531', 'Sylvain', 'LANGOILE', 'Veteran 3', 'actif', 'csv_initial'),
  ('07633527', 'Thibault', 'LARCHE', 'Minime 2', 'actif', 'csv_initial'),
  ('07136347', 'Jerome', 'LECOSSIER', 'Veteran 3', 'actif', 'csv_initial'),
  ('07403876', 'Mathis', 'LECOSSIER', 'Junior 2', 'actif', 'csv_initial'),
  ('07686338', 'Adrien', 'LEDIER', 'Senior', 'actif', 'csv_initial'),
  ('06722928', 'Nicolas', 'LEFEBVRE', 'Veteran 1', 'actif', 'csv_initial'),
  ('07714219', 'Theo', 'LEFILLATRE', 'Cadet 1', 'actif', 'csv_initial'),
  ('07651070', 'Sébastien', 'LEVASSEUR', 'Veteran 2', 'actif', 'csv_initial'),
  ('07627021', 'Timeo', 'LEVASSEUR', 'Cadet 2', 'actif', 'csv_initial'),
  ('07588319', 'Solomon', 'LOURDESSAMY', 'Senior', 'actif', 'csv_initial'),
  ('07719084', 'Cédric', 'LOUVEL', 'Senior', 'actif', 'csv_initial'),
  ('06539993', 'Fabrice', 'MANDIN', 'Veteran 3', 'actif', 'csv_initial'),
  ('07702816', 'Clara', 'MARIN', 'Junior 2', 'actif', 'csv_initial'),
  ('07734402', 'Hugo', 'MARTIN', 'Benjamin 2', 'actif', 'csv_initial'),
  ('07706963', 'Amandine', 'MAURICE', 'Minibad', 'actif', 'csv_initial'),
  ('06618139', 'Antony', 'MAURICE', 'Veteran 2', 'actif', 'csv_initial'),
  ('07356131', 'Arthur', 'MILON ERNY', 'Cadet 2', 'actif', 'csv_initial'),
  ('06635505', 'Gwladys', 'MINIER', 'Veteran 3', 'actif', 'csv_initial'),
  ('07522533', 'Arnaud', 'MOREAU', 'Veteran 3', 'actif', 'csv_initial'),
  ('07698133', 'Gaspard', 'MORIN', 'Minibad', 'actif', 'csv_initial'),
  ('07610093', 'Arianna', 'MUSENGELWA SAFI', 'Benjamin 2', 'actif', 'csv_initial'),
  ('00572284', 'Vincent', 'NAHAL', 'Veteran 1', 'actif', 'csv_initial'),
  ('07521504', 'Tim', 'NAMPHENG-KHAM', 'Junior 1', 'actif', 'csv_initial'),
  ('07698164', 'Leni', 'NAMPHENG-KHAN', 'Cadet 1', 'actif', 'csv_initial'),
  ('07564159', 'Quentin', 'NORGUET', 'Senior', 'actif', 'csv_initial'),
  ('07702755', 'Lucas', 'ORGEBIN', 'Senior', 'actif', 'csv_initial'),
  ('07649826', 'Yeliz', 'OZOGUL', 'Senior', 'actif', 'csv_initial'),
  ('07460513', 'Hugo', 'PETRIACQ', 'Cadet 1', 'actif', 'csv_initial'),
  ('07555140', 'Thomas', 'PHELION', 'Senior', 'actif', 'csv_initial'),
  ('07732115', 'Gabriel', 'PILON', 'Benjamin 2', 'actif', 'csv_initial'),
  ('07702768', 'Josselyn', 'POITOU', 'Senior', 'actif', 'csv_initial'),
  ('07627005', 'Yanis', 'PORTAUD', 'Junior 1', 'actif', 'csv_initial'),
  ('06535438', 'Didier', 'REMULE', 'Veteran 1', 'actif', 'csv_initial'),
  ('07567103', 'Julie', 'REMULE', 'Veteran 1', 'actif', 'csv_initial'),
  ('00417029', 'Kevin', 'RENARD', 'Veteran 1', 'actif', 'csv_initial'),
  ('07702762', 'Lea', 'RENARD', 'Senior', 'actif', 'csv_initial'),
  ('07555138', 'Julien', 'RICHARD', 'Senior', 'actif', 'csv_initial'),
  ('07522469', 'Lily-jade', 'ROCCA', 'Benjamin 2', 'actif', 'csv_initial'),
  ('07331438', 'Zoé', 'ROUSSEAU', 'Senior', 'actif', 'csv_initial'),
  ('07719103', 'Adem', 'SEN', 'Veteran 1', 'actif', 'csv_initial'),
  ('00213038', 'Nicolas', 'TESSIER', 'Veteran 4', 'actif', 'csv_initial'),
  ('07172926', 'Gil', 'TRONCO BAPTISTA', 'Veteran 1', 'actif', 'csv_initial'),
  ('07702843', 'Ezechiel', 'VEILLITH', 'Junior 1', 'actif', 'csv_initial'),
  ('07698114', 'Maxime', 'VINCENT', 'Cadet 2', 'actif', 'csv_initial'),
  ('07237178', 'Jonas', 'WEBER', 'Senior', 'actif', 'csv_initial'),
  ('07698120', 'Corentin', 'YVONNEAU', 'Senior', 'actif', 'csv_initial'),
  ('07698124', 'Esteban', 'ZAVARCE LOUIS', 'Minime 1', 'actif', 'csv_initial')
on conflict (licence_ffbad) do update
set
  prenom = excluded.prenom,
  nom = excluded.nom,
  categorie = excluded.categorie,
  statut = excluded.statut,
  source = excluded.source,
  updated_at = now();
