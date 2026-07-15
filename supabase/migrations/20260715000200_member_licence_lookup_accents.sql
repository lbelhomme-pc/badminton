-- Messages affichés à l'utilisateur lors de l'activation par licence.

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
    return query select false, false, null::text, null::text, null::text, null::text, 'Indique un numéro de licence FFBaD.'::text;
    return;
  end if;

  select *
  into licence_row
  from public.member_licences ml
  where ml.licence_ffbad = clean_licence
    and ml.statut = 'actif'
  limit 1;

  if not found then
    return query select false, false, clean_licence, null::text, null::text, null::text, 'Ce numéro de licence n''est pas reconnu comme actif par le club.'::text;
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
        when licence_row.claimed_by is null then 'Licence reconnue. Tu peux créer ton compte adhérent.'
        else 'Cette licence est déjà rattachée à un compte.'
      end;
end;
$$;

revoke all on function public.lookup_member_licence(text) from public;
grant execute on function public.lookup_member_licence(text) to anon;
grant execute on function public.lookup_member_licence(text) to authenticated;
