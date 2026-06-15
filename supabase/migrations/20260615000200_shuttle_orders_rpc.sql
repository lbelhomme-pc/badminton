-- Commandes de volants fiables et atomiques.
-- La creation d'une commande passe par une RPC : commande, stock et mouvement
-- sont traites dans la meme transaction.

drop trigger if exists commandes_volants_sync_stock_insert on public.commandes_volants;
drop trigger if exists commandes_volants_log_stock_insert on public.commandes_volants;

create or replace function public.create_shuttle_order(target_volant_id bigint, target_quantite integer)
returns table (
  order_id bigint,
  stock_after integer,
  total numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer_id uuid;
  current_stock integer;
  current_price numeric(10,2);
  created_order_id bigint;
  next_stock integer;
  order_total numeric(10,2);
begin
  buyer_id := (select auth.uid());

  if buyer_id is null then
    raise exception 'Connexion requise';
  end if;

  if target_quantite is null or target_quantite <= 0 then
    raise exception 'Quantite invalide';
  end if;

  select v.stock, v.prix
  into current_stock, current_price
  from public.volants v
  where v.id = target_volant_id
    and v.actif = true
  for update;

  if current_stock is null then
    raise exception 'Volant indisponible';
  end if;

  if current_stock < target_quantite then
    raise exception 'Stock insuffisant pour cette commande';
  end if;

  order_total := current_price * target_quantite;

  update public.volants
  set stock = stock - target_quantite
  where id = target_volant_id
  returning stock into next_stock;

  insert into public.commandes_volants (user_id, volant_id, quantite, statut, total)
  values (buyer_id, target_volant_id, target_quantite, 'demandee', order_total)
  returning id into created_order_id;

  insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
  values (target_volant_id, created_order_id, -target_quantite, next_stock, 'order_created', buyer_id);

  return query select created_order_id, next_stock, order_total;
end;
$$;

revoke all on function public.create_shuttle_order(bigint, integer) from public;
grant execute on function public.create_shuttle_order(bigint, integer) to authenticated;

create or replace function public.create_direct_shuttle_order(target_user_id uuid, target_volant_id bigint, target_quantite integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  manager_id uuid;
  current_stock integer;
  current_price numeric(10,2);
  created_order_id bigint;
  next_stock integer;
  order_total numeric(10,2);
begin
  manager_id := (select auth.uid());

  if not public.is_manager() then
    raise exception 'Acces reserve aux responsables du club';
  end if;

  if target_quantite is null or target_quantite <= 0 then
    raise exception 'Quantite invalide';
  end if;

  if not exists (select 1 from public.profiles p where p.id = target_user_id) then
    raise exception 'Adherent introuvable';
  end if;

  select v.stock, v.prix
  into current_stock, current_price
  from public.volants v
  where v.id = target_volant_id
    and v.actif = true
  for update;

  if current_stock is null then
    raise exception 'Volant indisponible';
  end if;

  if current_stock < target_quantite then
    raise exception 'Stock insuffisant pour cette vente';
  end if;

  order_total := current_price * target_quantite;

  update public.volants
  set stock = stock - target_quantite
  where id = target_volant_id
  returning stock into next_stock;

  insert into public.commandes_volants (user_id, volant_id, quantite, statut, total)
  values (target_user_id, target_volant_id, target_quantite, 'remise', order_total)
  returning id into created_order_id;

  insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
  values (target_volant_id, created_order_id, -target_quantite, next_stock, 'order_created', manager_id);

  return created_order_id;
end;
$$;

revoke all on function public.create_direct_shuttle_order(uuid, bigint, integer) from public;
grant execute on function public.create_direct_shuttle_order(uuid, bigint, integer) to authenticated;

-- Les insertions directes depuis le navigateur ne doivent plus etre le chemin normal :
-- elles contourneraient la transaction de stock. Les RPC ci-dessus restent executables.
drop policy if exists "commandes_volants_insert_own" on public.commandes_volants;
