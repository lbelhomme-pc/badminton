import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { appRolesToLegacyClubRole, legacyClubRoleToAppRoles, normalizeAppRoles, type AppRole, type LegacyClubRole } from "@/lib/roles";

export interface CreneauRow {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  gymnase: string;
  adresse: string | null;
  type: string;
  public: string;
  niveau: string | null;
  places_max: number | null;
  responsable: string | null;
  actif: boolean;
}

export interface ReservationRow {
  id: number;
  user_id: string;
  creneau_id: number;
  date_reservation: string;
  statut: string;
  commentaire: string | null;
  creneaux?: CreneauRow | null;
}

export interface ActualiteRow {
  id: number;
  titre: string;
  contenu: string;
  image_url: string | null;
  lien_url: string | null;
  lien_label: string | null;
  visible_public: boolean;
  published_at: string;
}

export interface VolantRow {
  id: number;
  marque: string;
  modele: string | null;
  type: string;
  prix: number;
  stock: number;
  actif: boolean;
}

export interface ShuttleOrderAdminRow {
  id: number;
  user_id: string;
  buyer_name: string | null;
  buyer_email: string | null;
  volant_label: string | null;
  quantite: number;
  statut: string;
  total: number | null;
  created_at: string;
}

export interface MemberChoiceRow {
  id: string;
  display_name: string | null;
  email: string | null;
}

export interface TarifRow {
  id: number;
  titre: string;
  description: string | null;
  montant: number;
  public: string | null;
  ordre: number;
  actif: boolean;
}

export interface ProfileRow {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  role: LegacyClubRole;
  roles: AppRole[];
  categorie: string | null;
}

interface UserRoleRow {
  user_id: string;
  role: AppRole;
}

function friendlyDatabaseError(error: { message: string; code?: string } | null | undefined) {
  if (!error) {
    return null;
  }

  const message = error.message.toLowerCase();

  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "Droits insuffisants. Vérifie que ton compte a bien le rôle admin/manager et reconnecte-toi.";
  }

  if (error.code === "23505" || message.includes("duplicate key")) {
    return "Cette donnée existe déjà.";
  }

  if (error.code === "23514" || message.includes("check constraint")) {
    return "Une valeur saisie n'est pas acceptée par la base.";
  }

  if (message.includes("invalid input syntax")) {
    return "Une valeur saisie n'est pas dans le bon format.";
  }

  if (message.includes("stock_movements_commande_id_fkey")) {
    return "Le suivi de stock Supabase doit être mis à jour. Exécute le script supabase/fix-volants-order-stock-trigger.sql puis réessaie.";
  }

  if (
    message.includes("list_members_for_manager") ||
    message.includes("list_shuttle_orders_for_manager") ||
    message.includes("create_direct_shuttle_order")
  ) {
    return "La vente rapide des volants doit être activée dans Supabase. Exécute le script supabase/volants-vente-rapide.sql puis réessaie.";
  }

  if (message.includes("schema cache")) {
    return "La structure Supabase vient de changer. Attends quelques secondes puis réessaie.";
  }

  return error.message;
}

export type SiteSettingKey = "club" | "contact";

export interface SiteSettingRow {
  key: SiteSettingKey;
  value: Record<string, string>;
  visibility: "public" | "internal" | "admin";
}

export interface RankingRow {
  id: number;
  display_name: string;
  categorie: string | null;
  classement_simple: string | null;
  classement_double: string | null;
  classement_mixte: string | null;
  points_simple: number | null;
  points_double: number | null;
  points_mixte: number | null;
  progression: string | null;
  equipe: string | null;
  synced_at: string | null;
}

export async function fetchCreneaux() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as CreneauRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("creneaux").select("*").order("id", { ascending: true });
  return { data: (data ?? []) as CreneauRow[], error: friendlyDatabaseError(error) };
}

export async function createCreneau(input: Omit<CreneauRow, "id">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("creneaux").insert(input);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Créneau créé." };
}

export async function updateCreneau(id: number, input: Partial<CreneauRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("creneaux").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Créneau mis à jour." };
}

export async function fetchMyReservations() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ReservationRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("reservations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: true });

  return { data: (data ?? []) as ReservationRow[], error: friendlyDatabaseError(error) };
}

export async function fetchAllReservations() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ReservationRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("reservations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: false });

  return { data: (data ?? []) as ReservationRow[], error: friendlyDatabaseError(error) };
}

export async function createReservation(userId: string, creneauId: number, dateReservation: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("reservations").insert({
    user_id: userId,
    creneau_id: creneauId,
    date_reservation: dateReservation,
    statut: "confirmee"
  });

  if (error?.code === "23505") {
    return { ok: false, message: "Tu as déjà réservé ce créneau." };
  }

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Réservation confirmée." };
}

export async function updateReservationStatus(id: number, statut: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("reservations").update({ statut }).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Réservation mise à jour." };
}

export async function fetchActualites(includeInternal = false) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ActualiteRow[], error: "Configuration Supabase manquante." };

  let query = supabase.from("actualites").select("*").order("published_at", { ascending: false });
  if (!includeInternal) {
    query = query.eq("visible_public", true);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as ActualiteRow[], error: friendlyDatabaseError(error) };
}

export type ActualiteInput = Pick<ActualiteRow, "titre" | "contenu" | "visible_public"> &
  Partial<Pick<ActualiteRow, "image_url" | "lien_url" | "lien_label">> & {
    auteur_id?: string;
  };

export async function createActualite(input: ActualiteInput) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").insert(input);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Actualité créée." };
}

export async function updateActualite(id: number, input: Partial<ActualiteInput>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Actualité mise à jour." };
}

export async function deleteActualite(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").delete().eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Actualité supprimée." };
}

export async function fetchVolants() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as VolantRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("volants").select("*").order("id", { ascending: true });
  return { data: (data ?? []) as VolantRow[], error: friendlyDatabaseError(error) };
}

export async function fetchTarifs(includeInactive = false) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as TarifRow[], error: "Configuration Supabase manquante." };

  let query = supabase.from("tarifs").select("*").order("ordre", { ascending: true });
  if (!includeInactive) {
    query = query.eq("actif", true);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as TarifRow[], error: friendlyDatabaseError(error) };
}

export async function createTarif(input: Omit<TarifRow, "id">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("tarifs").insert(input);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Tarif créé." };
}

export async function updateTarif(id: number, input: Partial<TarifRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("tarifs").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Tarif mis à jour." };
}

export async function deleteTarif(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("tarifs").delete().eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Tarif supprimé." };
}

export async function fetchSiteSettings() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as SiteSettingRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("settings_site").select("key, value, visibility").in("key", ["club", "contact"]);

  return { data: (data ?? []) as SiteSettingRow[], error: friendlyDatabaseError(error) };
}

export async function upsertSiteSetting(input: SiteSettingRow) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("settings_site").upsert(input, { onConflict: "key" });
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Paramètre mis à jour." };
}

export async function createVolant(input: Omit<VolantRow, "id">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("volants").insert(input);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Volant ajouté." };
}

export async function updateVolant(id: number, input: Partial<VolantRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("volants").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Volant mis à jour." };
}

export async function createCommandeVolants(userId: string, volant: VolantRow, quantite: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("commandes_volants").insert({
    user_id: userId,
    volant_id: volant.id,
    quantite,
    statut: "demandee",
    total: Number(volant.prix) * quantite
  });

  if (error?.message.includes("Stock insuffisant")) {
    return { ok: false, message: "Stock insuffisant pour cette commande." };
  }

  if (error?.message.includes("Volant indisponible")) {
    return { ok: false, message: "Ce modèle de volant n'est plus disponible." };
  }

  return {
    ok: !error,
    message: friendlyDatabaseError(error) ?? `Commande de ${quantite} tube${quantite > 1 ? "s" : ""} envoyée. Le stock a été mis à jour.`
  };
}

export async function fetchShuttleOrdersForManager(limitCount = 12) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ShuttleOrderAdminRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.rpc("list_shuttle_orders_for_manager", {
    limit_count: limitCount
  });

  return { data: (data ?? []) as ShuttleOrderAdminRow[], error: friendlyDatabaseError(error) };
}

export async function fetchMemberChoicesForManager() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as MemberChoiceRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.rpc("list_members_for_manager");
  return { data: (data ?? []) as MemberChoiceRow[], error: friendlyDatabaseError(error) };
}

export async function createDirectCommandeVolants(input: { userId: string; volantId: number; quantite: number }) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.rpc("create_direct_shuttle_order", {
    target_user_id: input.userId,
    target_volant_id: input.volantId,
    target_quantite: input.quantite
  });

  if (error?.message.includes("Stock insuffisant")) {
    return { ok: false, message: "Stock insuffisant pour cette vente." };
  }

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Vente sur place enregistrée. Le stock a été mis à jour." };
}

export async function fetchProfiles() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ProfileRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("profiles").select("id, prenom, nom, email, telephone, role, categorie").order("nom");
  if (error) {
    return { data: [] as ProfileRow[], error: friendlyDatabaseError(error) ?? error.message };
  }

  const profiles = (data ?? []) as Omit<ProfileRow, "roles">[];
  const { data: roleRows, error: rolesError } = await supabase.from("user_roles").select("user_id, role");
  const rolesByUser: Record<string, AppRole[]> = {};

  if (!rolesError) {
    ((roleRows ?? []) as UserRoleRow[]).forEach((row) => {
      rolesByUser[row.user_id] = normalizeAppRoles([...(rolesByUser[row.user_id] ?? []), row.role]);
    });
  }

  return {
    data: profiles.map((profile) => ({
      ...profile,
      roles: rolesByUser[profile.id] ?? legacyClubRoleToAppRoles(profile.role)
    })),
    error: rolesError ? "Rôles avancés indisponibles : compatibilité avec l'ancien rôle utilisée." : null
  };
}

export async function updateProfileRole(id: string, role: ProfileRow["role"]) {
  return updateUserRoles(id, legacyClubRoleToAppRoles(role));
}

function isMissingRpc(errorMessage: string) {
  const message = errorMessage.toLowerCase();
  return message.includes("could not find the function") || message.includes("schema cache") || message.includes("set_user_roles");
}

export async function updateUserRoles(id: string, roles: AppRole[]) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const nextRoles = normalizeAppRoles(roles);
  const { error: rpcError } = await supabase.rpc("set_user_roles", {
    target_user_id: id,
    target_roles: nextRoles
  });

  if (!rpcError) {
    return { ok: true, message: "Rôles mis à jour." };
  }

  if (!isMissingRpc(rpcError.message)) {
    return { ok: false, message: rpcError.message };
  }

  const legacyRole = appRolesToLegacyClubRole(nextRoles);
  const { error: legacyError } = await supabase.from("profiles").update({ role: legacyRole }).eq("id", id);

  if (legacyError) {
    return { ok: false, message: legacyError.message };
  }

  const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", id);

  if (!deleteError) {
    const { error: insertError } = await supabase.from("user_roles").insert(nextRoles.map((role) => ({ user_id: id, role })));
    if (insertError) {
      return { ok: true, message: "Rôle principal mis à jour. Les rôles avancés seront disponibles après la migration Supabase." };
    }
  }

  return { ok: true, message: "Rôles mis à jour." };
}

export async function fetchPublicRankings() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as RankingRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("rankings")
    .select(
      "id, display_name, categorie, classement_simple, classement_double, classement_mixte, points_simple, points_double, points_mixte, progression, equipe, synced_at"
    )
    .eq("active", true)
    .eq("visibility", "public")
    .order("display_name", { ascending: true });

  return { data: (data ?? []) as RankingRow[], error: friendlyDatabaseError(error) };
}
