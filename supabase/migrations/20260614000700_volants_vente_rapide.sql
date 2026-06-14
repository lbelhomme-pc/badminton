-- Migration ponctuelle : vente rapide de volants sur place.
-- A executer dans Supabase SQL Editor sur une base deja en ligne.
-- Pre-requis : les tables profiles, volants, commandes_volants et les fonctions is_manager()
-- doivent exister. Le trigger de stock des volants doit aussi etre installe.

create or replace function public.list_members_for_manager()
returns table (
  id uuid,
  display_name text,
  email text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  return query
  select
    p.id,
    nullif(trim(concat(coalesce(p.prenom, ''), ' ', coalesce(p.nom, ''))), '') as display_name,
    p.email
  from public.profiles p
  order by p.nom nulls last, p.prenom nulls last, p.email nulls last;
end;
$$;

revoke all on function public.list_members_for_manager() from public;
grant execute on function public.list_members_for_manager() to authenticated;

create or replace function public.list_shuttle_orders_for_manager(limit_count integer default 12)
returns table (
  id bigint,
  user_id uuid,
  buyer_name text,
  buyer_email text,
  volant_label text,
  quantite integer,
  statut text,
  total numeric,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  return query
  select
    c.id,
    c.user_id,
    nullif(trim(concat(coalesce(p.prenom, ''), ' ', coalesce(p.nom, ''))), '') as buyer_name,
    p.email as buyer_email,
    trim(concat(v.marque, ' ', coalesce(v.modele, ''))) as volant_label,
    c.quantite,
    c.statut,
    c.total,
    c.created_at
  from public.commandes_volants c
  left join public.profiles p on p.id = c.user_id
  left join public.volants v on v.id = c.volant_id
  order by c.created_at desc
  limit greatest(1, least(coalesce(limit_count, 12), 50));
end;
$$;

revoke all on function public.list_shuttle_orders_for_manager(integer) from public;
grant execute on function public.list_shuttle_orders_for_manager(integer) to authenticated;

create or replace function public.create_direct_shuttle_order(target_user_id uuid, target_volant_id bigint, target_quantite integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order_id bigint;
begin
  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  if target_quantite is null or target_quantite <= 0 then
    raise exception 'Quantite invalide';
  end if;

  if not exists (select 1 from public.profiles p where p.id = target_user_id) then
    raise exception 'Adherent introuvable';
  end if;

  insert into public.commandes_volants (user_id, volant_id, quantite, statut, total)
  select target_user_id, v.id, target_quantite, 'remise', v.prix * target_quantite
  from public.volants v
  where v.id = target_volant_id
    and v.actif = true
  returning commandes_volants.id into created_order_id;

  if created_order_id is null then
    raise exception 'Volant indisponible';
  end if;

  return created_order_id;
end;
$$;

revoke all on function public.create_direct_shuttle_order(uuid, bigint, integer) from public;
grant execute on function public.create_direct_shuttle_order(uuid, bigint, integer) to authenticated;
