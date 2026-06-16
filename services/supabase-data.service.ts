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
  member_name?: string | null;
  member_email?: string | null;
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

export interface ShuttleOrderMemberRow {
  id: number;
  volant_id: number;
  quantite: number;
  statut: string;
  total: number | null;
  created_at: string;
  volants?: VolantRow | null;
}

export interface MemberChoiceRow {
  id: string;
  display_name: string | null;
  email: string | null;
}

export interface WaitingListRow {
  id: number;
  user_id: string;
  creneau_id: number;
  date_reservation: string;
  statut: string;
  notified_at: string | null;
  created_at: string;
  creneaux?: CreneauRow | null;
}

export interface CreneauCancellationRow {
  id: number;
  creneau_id: number;
  date_reservation: string;
  reason: string | null;
  created_at: string;
  creneaux?: CreneauRow | null;
}

export interface CreneauAvailabilityRow extends CreneauRow {
  occurrence_date: string;
  reserved_count: number;
  waiting_count: number;
  places_left: number | null;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  user_reservation_id: number | null;
  user_reservation_status: string | null;
  user_waiting_status: string | null;
}

interface ReservationManagerRpcRow {
  id: number;
  user_id: string;
  member_name: string | null;
  member_email: string | null;
  creneau_id: number;
  date_reservation: string;
  statut: string;
  commentaire: string | null;
  creneau_jour: string | null;
  creneau_heure_debut: string | null;
  creneau_heure_fin: string | null;
  creneau_gymnase: string | null;
  creneau_adresse: string | null;
  creneau_type: string | null;
  creneau_public: string | null;
  creneau_niveau: string | null;
  creneau_places_max: number | null;
  creneau_responsable: string | null;
  creneau_actif: boolean | null;
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

  if (message.includes("annulation impossible moins de 2 heures")) {
    return "Annulation impossible moins de 2 heures avant le créneau. Contacte le responsable si besoin.";
  }

  if (message.includes("stock_movements_commande_id_fkey")) {
    return "Le suivi de stock Supabase doit être mis à jour. Exécute le script supabase/fix-volants-order-stock-trigger.sql puis réessaie.";
  }

  if (
    message.includes("create_shuttle_order") ||
    message.includes("list_members_for_manager") ||
    message.includes("list_shuttle_orders_for_manager") ||
    message.includes("create_direct_shuttle_order")
  ) {
    return "Le module volants doit être mis à jour dans Supabase. Exécute les dernières migrations puis réessaie.";
  }

  if (
    message.includes("list_creneaux_availability") ||
    message.includes("reserve_creneau") ||
    message.includes("cancel_reservation") ||
    message.includes("list_reservations_for_manager") ||
    message.includes("create_creneau_cancellation") ||
    message.includes("delete_creneau_cancellation") ||
    message.includes("waiting_list") ||
    message.includes("creneau_annulations")
  ) {
    return "Les nouvelles règles de réservation doivent être activées dans Supabase. Exécute le script supabase/reservations-ameliorations-2026.sql puis réessaie.";
  }

  if (message.includes("schema cache")) {
    return "La structure Supabase vient de changer. Attends quelques secondes puis réessaie.";
  }

  return error.message;
}

export type SiteSettingKey = "club" | "contact" | "bureau" | "venue";

export interface SiteSettingRow {
  key: SiteSettingKey;
  value: Record<string, unknown>;
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

export async function fetchPublicCreneaux() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as CreneauRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("creneaux").select("*").eq("actif", true).order("id", { ascending: true });
  return { data: (data ?? []) as CreneauRow[], error: friendlyDatabaseError(error) };
}

export async function fetchCreneauAvailability(startDate: string, endDate: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as CreneauAvailabilityRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.rpc("list_creneaux_availability", {
    start_date: startDate,
    end_date: endDate
  });

  return { data: (data ?? []) as CreneauAvailabilityRow[], error: friendlyDatabaseError(error) };
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

export async function fetchCreneauCancellations(startDate?: string, endDate?: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as CreneauCancellationRow[], error: "Configuration Supabase manquante." };

  let query = supabase
    .from("creneau_annulations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: true });

  if (startDate) {
    query = query.gte("date_reservation", startDate);
  }

  if (endDate) {
    query = query.lte("date_reservation", endDate);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as CreneauCancellationRow[], error: friendlyDatabaseError(error) };
}

export async function createCreneauCancellation(input: { creneauId: number; dateReservation: string; reason?: string }) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.rpc("create_creneau_cancellation", {
    target_creneau_id: input.creneauId,
    target_date: input.dateReservation,
    target_reason: input.reason?.trim() || null
  });

  if (!error) {
    return { ok: true, message: "Créneau annulé pour cette date." };
  }

  const rpcMessage = friendlyDatabaseError(error);
  if (rpcMessage && !rpcMessage.includes("nouvelles règles")) {
    return { ok: false, message: rpcMessage };
  }

  const fallback = await supabase.from("creneau_annulations").upsert(
    {
      creneau_id: input.creneauId,
      date_reservation: input.dateReservation,
      reason: input.reason?.trim() || null
    },
    { onConflict: "creneau_id,date_reservation" }
  );

  return { ok: !fallback.error, message: friendlyDatabaseError(fallback.error) ?? "Créneau annulé pour cette date." };
}

export async function deleteCreneauCancellation(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.rpc("delete_creneau_cancellation", {
    target_cancellation_id: id
  });

  if (!error) {
    return { ok: true, message: "Annulation exceptionnelle retirée." };
  }

  const rpcMessage = friendlyDatabaseError(error);
  if (rpcMessage && !rpcMessage.includes("nouvelles règles")) {
    return { ok: false, message: rpcMessage };
  }

  const fallback = await supabase.from("creneau_annulations").delete().eq("id", id);
  return { ok: !fallback.error, message: friendlyDatabaseError(fallback.error) ?? "Annulation exceptionnelle retirée." };
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

  const { data: managerRows, error: managerError } = await supabase.rpc("list_reservations_for_manager");

  if (!managerError) {
    const rows = (managerRows ?? []) as ReservationManagerRpcRow[];
    return {
      data: rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        member_name: row.member_name,
        member_email: row.member_email,
        creneau_id: row.creneau_id,
        date_reservation: row.date_reservation,
        statut: row.statut,
        commentaire: row.commentaire,
        creneaux: row.creneau_jour
          ? {
              id: row.creneau_id,
              jour: row.creneau_jour,
              heure_debut: row.creneau_heure_debut ?? "00:00:00",
              heure_fin: row.creneau_heure_fin ?? "00:00:00",
              gymnase: row.creneau_gymnase ?? "Gymnase",
              adresse: row.creneau_adresse,
              type: row.creneau_type ?? "jeu_libre",
              public: row.creneau_public ?? "tous",
              niveau: row.creneau_niveau,
              places_max: row.creneau_places_max,
              responsable: row.creneau_responsable,
              actif: row.creneau_actif ?? true
            }
          : null
      })),
      error: null
    };
  }

  const managerMessage = friendlyDatabaseError(managerError);
  if (managerMessage && !managerMessage.includes("nouvelles règles")) {
    return { data: [] as ReservationRow[], error: managerMessage };
  }

  const { data, error } = await supabase
    .from("reservations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: false });

  return { data: (data ?? []) as ReservationRow[], error: friendlyDatabaseError(error) };
}

export async function createReservation(userId: string, creneauId: number, dateReservation: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { data: reserveData, error: reserveError } = await supabase.rpc("reserve_creneau", {
    target_creneau_id: creneauId,
    target_date: dateReservation
  });

  if (!reserveError) {
    const first = Array.isArray(reserveData) ? reserveData[0] : reserveData;
    return {
      ok: true,
      message:
        first?.message ??
        (first?.status === "liste_attente"
          ? "Créneau complet : tu es inscrit sur la liste d'attente."
          : "Réservation confirmée.")
    };
  }

  const reserveMessage = friendlyDatabaseError(reserveError);
  if (reserveMessage && !reserveMessage.includes("nouvelles règles")) {
    return { ok: false, message: reserveMessage };
  }

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

export async function cancelReservation(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { data, error } = await supabase.rpc("cancel_reservation", {
    target_reservation_id: id
  });

  if (!error) {
    const first = Array.isArray(data) ? data[0] : data;
    return { ok: true, message: first?.message ?? "Réservation annulée." };
  }

  const cancelMessage = friendlyDatabaseError(error);
  if (cancelMessage && !cancelMessage.includes("nouvelles règles")) {
    return { ok: false, message: cancelMessage };
  }

  return updateReservationStatus(id, "annulee");
}

export async function cancelReservationForSlot(input: { reservationId?: number | null; creneauId: number; dateReservation: string }) {
  if (input.reservationId) {
    return cancelReservation(input.reservationId);
  }

  const result = await fetchMyReservations();
  if (result.error) {
    return { ok: false, message: result.error };
  }

  const reservation = result.data.find(
    (item) =>
      item.creneau_id === input.creneauId &&
      item.date_reservation === input.dateReservation &&
      !["annulee", "refusee"].includes(item.statut)
  );

  if (!reservation) {
    return { ok: false, message: "Impossible de retrouver cette réservation. Recharge la page puis réessaie." };
  }

  return cancelReservation(reservation.id);
}

export async function fetchMyWaitingList() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as WaitingListRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("waiting_list")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: true });

  return { data: (data ?? []) as WaitingListRow[], error: friendlyDatabaseError(error) };
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

  const { data, error } = await supabase.from("settings_site").select("key, value, visibility").in("key", ["club", "contact", "bureau", "venue"]);

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

  if (!userId) {
    return { ok: false, message: "Tu dois etre connecte pour commander des volants." };
  }

  const safeQuantity = Math.floor(quantite);

  if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
    return { ok: false, message: "Choisis au moins 1 tube." };
  }

  if (safeQuantity > volant.stock) {
    return { ok: false, message: "Stock insuffisant pour cette commande." };
  }

  const { error } = await supabase.rpc("create_shuttle_order", {
    target_volant_id: volant.id,
    target_quantite: safeQuantity
  });

  if (error?.message.includes("Stock insuffisant")) {
    return { ok: false, message: "Stock insuffisant pour cette commande." };
  }

  if (error?.message.includes("Volant indisponible")) {
    return { ok: false, message: "Ce modèle de volant n'est plus disponible." };
  }

  return {
    ok: !error,
    message: friendlyDatabaseError(error) ?? `Commande de ${safeQuantity} tube${safeQuantity > 1 ? "s" : ""} créée. Le stock a été mis à jour.`
  };
}

export async function fetchMyShuttleOrders() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ShuttleOrderMemberRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("commandes_volants")
    .select("id, volant_id, quantite, statut, total, created_at, volants(*)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Array<Omit<ShuttleOrderMemberRow, "volants"> & { volants?: VolantRow | VolantRow[] | null }>;

  return {
    data: rows.map((row) => ({
      ...row,
      volants: Array.isArray(row.volants) ? (row.volants[0] ?? null) : (row.volants ?? null)
    })),
    error: friendlyDatabaseError(error)
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
