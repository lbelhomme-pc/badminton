-- Migration ponctuelle pour ajouter les tarifs editables.
-- A executer si la base existe deja, apres schema.sql et rls.sql initiaux.

create table if not exists public.tarifs (
  id bigint generated always as identity primary key,
  titre text not null,
  description text,
  montant numeric(10,2) not null default 0,
  public text,
  ordre integer not null default 10,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tarifs_montant_check check (montant >= 0)
);

create index if not exists tarifs_actif_idx on public.tarifs(actif);
create index if not exists tarifs_ordre_idx on public.tarifs(ordre);

drop trigger if exists tarifs_set_updated_at on public.tarifs;
create trigger tarifs_set_updated_at
before update on public.tarifs
for each row execute function public.set_updated_at();

alter table public.tarifs enable row level security;

drop policy if exists "tarifs_public_select_active" on public.tarifs;
drop policy if exists "tarifs_admin_all" on public.tarifs;

create policy "tarifs_public_select_active"
on public.tarifs
for select
using (actif = true or public.is_admin());

create policy "tarifs_admin_all"
on public.tarifs
for all
using (public.is_admin())
with check (public.is_admin());

insert into public.tarifs (titre, description, montant, public, ordre, actif)
select *
from (
  values
    ('Jeunes', 'Ecole de badminton, creneaux encadres et licence.', 0.00::numeric, 'Jeunes', 1, true),
    ('Licence loisirs', 'Acces aux creneaux loisirs et jeu libre adultes.', 60.00::numeric, 'Loisirs', 2, true),
    ('Licence competiteurs', 'Licence adaptee aux tournois, interclubs et creneaux competiteurs.', 95.00::numeric, 'Competiteurs', 3, true),
    ('Essai', 'Jusqu''a 3 seances gratuites pour decouvrir.', 0.00::numeric, 'Decouverte', 4, true)
) as seed(titre, description, montant, public, ordre, actif)
where not exists (select 1 from public.tarifs);
