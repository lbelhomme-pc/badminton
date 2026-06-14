-- Correctif a executer dans Supabase SQL Editor si les commandes de volants
-- affichent une erreur stock_movements_commande_id_fkey.
-- Le mouvement de stock doit etre journalise APRES la creation de la commande.

create table if not exists public.stock_movements (
  id bigint generated always as identity primary key,
  volant_id bigint not null references public.volants(id) on delete cascade,
  commande_id bigint references public.commandes_volants(id) on delete set null,
  delta integer not null,
  stock_after integer,
  reason text not null default 'manual_adjustment',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint stock_movements_delta_check check (delta <> 0),
  constraint stock_movements_reason_check check (reason in ('order_created', 'order_cancelled', 'order_quantity_changed', 'manual_adjustment', 'initial_stock'))
);

create index if not exists stock_movements_volant_idx on public.stock_movements(volant_id);
create index if not exists stock_movements_commande_idx on public.stock_movements(commande_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements(created_at desc);

create or replace function public.sync_volant_stock_for_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  current_price numeric(10,2);
  old_active boolean;
  new_active boolean;
  delta integer;
begin
  if tg_op = 'INSERT' then
    if new.statut <> 'annulee' then
      select stock, prix
      into current_stock, current_price
      from public.volants
      where id = new.volant_id and actif = true
      for update;

      if current_stock is null then
        raise exception 'Volant indisponible';
      end if;

      if current_stock < new.quantite then
        raise exception 'Stock insuffisant pour cette commande';
      end if;

      update public.volants
      set stock = stock - new.quantite
      where id = new.volant_id
      returning stock into current_stock;

      if new.total is null then
        new.total := current_price * new.quantite;
      end if;
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    old_active := old.statut <> 'annulee';
    new_active := new.statut <> 'annulee';
    delta := 0;

    if old_active and not new_active then
      delta := old.quantite;
    elsif not old_active and new_active then
      delta := -new.quantite;
    elsif old_active and new_active and old.quantite <> new.quantite then
      delta := old.quantite - new.quantite;
    end if;

    if delta < 0 then
      select stock
      into current_stock
      from public.volants
      where id = new.volant_id
      for update;

      if current_stock is null or current_stock < abs(delta) then
        raise exception 'Stock insuffisant pour cette commande';
      end if;
    end if;

    if delta <> 0 then
      update public.volants
      set stock = stock + delta
      where id = new.volant_id
      returning stock into current_stock;

      insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
      values (
        new.volant_id,
        new.id,
        delta,
        current_stock,
        case
          when old_active and not new_active then 'order_cancelled'
          else 'order_quantity_changed'
        end,
        coalesce(auth.uid(), new.user_id)
      );
    end if;

    return new;
  end if;

  return new;
end;
$$;

create or replace function public.log_volant_stock_for_order_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
begin
  if new.statut <> 'annulee' then
    select stock
    into current_stock
    from public.volants
    where id = new.volant_id;

    insert into public.stock_movements (volant_id, commande_id, delta, stock_after, reason, created_by)
    values (new.volant_id, new.id, -new.quantite, current_stock, 'order_created', coalesce(auth.uid(), new.user_id));
  end if;

  return new;
end;
$$;

drop trigger if exists commandes_volants_sync_stock_insert on public.commandes_volants;
create trigger commandes_volants_sync_stock_insert
before insert on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();

drop trigger if exists commandes_volants_log_stock_insert on public.commandes_volants;
create trigger commandes_volants_log_stock_insert
after insert on public.commandes_volants
for each row execute function public.log_volant_stock_for_order_insert();

drop trigger if exists commandes_volants_sync_stock_update on public.commandes_volants;
create trigger commandes_volants_sync_stock_update
before update of statut, quantite on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();
