-- Migration a executer une fois sur une base Supabase deja creee.
-- Elle automatise le stock des volants lors des commandes adherents.

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
      where id = new.volant_id;

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
      where id = new.volant_id;
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists commandes_volants_sync_stock_insert on public.commandes_volants;
create trigger commandes_volants_sync_stock_insert
before insert on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();

drop trigger if exists commandes_volants_sync_stock_update on public.commandes_volants;
create trigger commandes_volants_sync_stock_update
before update of statut, quantite on public.commandes_volants
for each row execute function public.sync_volant_stock_for_order();
