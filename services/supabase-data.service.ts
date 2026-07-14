import { isAllowedPrivateDocumentFile, sanitizePrivateDocumentFileName } from "@/lib/private-documents";
import type { CsvImportRow } from "@/lib/back-office-rules";
import { canDeleteMediaAsset, mediaBucketName, sanitizeMediaFileName, validateMediaAssetInput, type MediaKind } from "@/lib/media-library";
import { buildActivationUrl, getDefaultInvitationExpiration, type MemberInvitationStatus } from "@/lib/member-invitations";
import { appRolesToLegacyClubRole, legacyClubRoleToAppRoles, normalizeAppRoles, type AppRole, type LegacyClubRole } from "@/lib/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ClubEvent, ClubEventCategory, ClubEventStatus } from "@/types/domain";

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
  reservation_active?: boolean | null;
  reservation_open_days?: number | null;
  reservation_open_time?: string | null;
  reservation_close_minutes_before?: number | null;
  cancellation_deadline_hours?: number | null;
  reservation_message?: string | null;
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
  statut?: string | null;
  published_at: string;
  archived_at?: string | null;
  deleted_at?: string | null;
}

export interface EventRow {
  id: number;
  slug: string | null;
  titre: string;
  description: string;
  categorie: string;
  statut: string;
  starts_at: string;
  ends_at: string | null;
  lieu: string | null;
  public_cible: string | null;
  image_url: string | null;
  contact_label: string | null;
  contact_href: string | null;
  lien_url: string | null;
  piece_jointe_url: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  cancellation_message: string | null;
  recurrence_rule: string | null;
  parent_event_id: number | null;
  exception_date: string | null;
  visible_public: boolean;
  deleted_at?: string | null;
}

export interface VolantRow {
  id: number;
  marque: string;
  modele: string | null;
  type: string;
  prix: number;
  stock: number;
  actif: boolean;
  reference?: string | null;
  quantite_boite?: number | null;
  photo_url?: string | null;
  disponibilite?: string | null;
  limite_commande?: number | null;
  instructions_retrait?: string | null;
  helloasso_url?: string | null;
  helloasso_item_id?: string | null;
  payment_provider?: string | null;
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

export interface PrivateDocumentRow {
  id: number;
  titre: string;
  description: string | null;
  categorie: string;
  bucket_name: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  auteur: string | null;
  version_label: string | null;
  allowed_roles: string[];
  statut: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRow {
  id: number;
  title: string;
  description: string | null;
  bucket_name: string;
  file_path: string;
  file_name: string;
  public_url: string | null;
  mime_type: string;
  size_bytes: number;
  kind: MediaKind;
  alt_text: string | null;
  credit: string | null;
  informative: boolean;
  known_usage: string[];
  status: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
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
  reservation_active: boolean | null;
  reservation_open_days: number | null;
  reservation_open_time: string | null;
  reservation_close_minutes_before: number | null;
  cancellation_deadline_hours: number | null;
  reservation_message: string | null;
  opens_at: string | null;
  closes_at: string | null;
  cancellation_deadline_at: string | null;
  can_reserve: boolean | null;
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
  statut?: string | null;
  licence_ffbad?: string | null;
}

interface UserRoleRow {
  user_id: string;
  role: AppRole;
}

export interface MemberInvitationRow {
  id: string;
  email: string;
  licence_ffbad: string | null;
  status: MemberInvitationStatus;
  role: LegacyClubRole;
  roles: AppRole[];
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  invited_by: string | null;
  revoked_at: string | null;
  metadata: {
    prenom?: string;
    nom?: string;
    reminder_of?: string;
    reminder_count?: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreatedMemberInvitation {
  email: string;
  prenom: string;
  nom: string;
  activationUrl: string;
  expiresAt: string;
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

export type SiteSettingKey = "club" | "contact" | "bureau" | "venue" | "partners";

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
  return {
    ok: false,
    message: rpcMessage ?? "La migration Supabase des fermetures exceptionnelles doit être appliquée avant cette action."
  };
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
  return {
    ok: false,
    message: rpcMessage ?? "La migration Supabase des annulations exceptionnelles doit être appliquée avant cette action."
  };
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
  return {
    ok: false,
    message: reserveMessage ?? "La migration Supabase des réservations atomiques doit être appliquée avant de réserver."
  };
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
  return {
    ok: false,
    message: cancelMessage ?? "La migration Supabase des annulations atomiques doit être appliquée avant d'annuler."
  };
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
    query = query.eq("visible_public", true).eq("statut", "publie").is("deleted_at", null);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as ActualiteRow[], error: friendlyDatabaseError(error) };
}

function normalizeEventCategory(value: string | null | undefined): ClubEventCategory {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "competition" || normalized === "club_event" || normalized === "meeting" || normalized === "camp" || normalized === "closure") {
    return normalized;
  }

  if (normalized.includes("competition") || normalized.includes("tournoi")) return "competition";
  if (normalized.includes("reunion") || normalized.includes("réunion")) return "meeting";
  if (normalized.includes("stage")) return "camp";
  if (normalized.includes("fermeture")) return "closure";

  return "club_event";
}

function normalizeEventStatus(value: string | null | undefined): ClubEventStatus {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "draft" || normalized === "published" || normalized === "scheduled" || normalized === "cancelled") {
    return normalized;
  }

  if (normalized === "brouillon") return "draft";
  if (normalized === "publie" || normalized === "publié") return "published";
  if (normalized === "programme" || normalized === "programmé") return "scheduled";
  if (normalized === "annule" || normalized === "annulé") return "cancelled";

  return "draft";
}

export function eventRowsToClubEvents(rows: EventRow[]): ClubEvent[] {
  return rows.map((row) => ({
    id: row.slug || `event-${row.id}`,
    title: row.titre,
    category: normalizeEventCategory(row.categorie),
    status: normalizeEventStatus(row.statut),
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    venueName: row.lieu ?? undefined,
    audience: row.public_cible ?? undefined,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    contactLabel: row.contact_label ?? undefined,
    contactHref: row.contact_href ?? undefined,
    externalUrl: row.lien_url ?? undefined,
    attachmentUrl: row.piece_jointe_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    cancellationMessage: row.cancellation_message ?? undefined,
    recurrenceRule: row.recurrence_rule ?? undefined,
    parentEventId: row.parent_event_id ? `event-${row.parent_event_id}` : undefined,
    exceptionDate: row.exception_date ?? undefined
  }));
}

export async function fetchPublicEvents() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ClubEvent[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("visible_public", true)
    .is("deleted_at", null)
    .order("starts_at", { ascending: true });

  return { data: eventRowsToClubEvents((data ?? []) as EventRow[]), error: friendlyDatabaseError(error) };
}

export type EventInput = Pick<EventRow, "titre" | "description" | "categorie" | "statut" | "starts_at" | "visible_public"> &
  Partial<
    Pick<
      EventRow,
      | "slug"
      | "ends_at"
      | "lieu"
      | "public_cible"
      | "image_url"
      | "contact_label"
      | "contact_href"
      | "lien_url"
      | "piece_jointe_url"
      | "published_at"
      | "scheduled_for"
      | "cancellation_message"
      | "recurrence_rule"
      | "parent_event_id"
      | "exception_date"
    >
  > & {
    created_by?: string | null;
  };

export async function fetchAdminEvents() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as EventRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
  return { data: (data ?? []) as EventRow[], error: friendlyDatabaseError(error) };
}

export async function createEvent(input: EventInput) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("events").insert(input);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Événement créé." };
}

export async function updateEvent(id: number, input: Partial<EventInput>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("events").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Événement mis à jour." };
}

export async function deleteEvent(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("events").update({ deleted_at: new Date().toISOString(), visible_public: false }).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Événement supprimé." };
}

export async function restoreEvent(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("events").update({ deleted_at: null, statut: "draft" }).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Evenement restaure en brouillon." };
}

export async function deleteEventPermanently(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("events").delete().eq("id", id).not("deleted_at", "is", null);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Evenement supprime definitivement." };
}

export async function duplicateEvent(event: EventRow) {
  const copy: EventInput = {
    titre: `${event.titre} (copie)`,
    description: event.description,
    categorie: event.categorie,
    statut: "draft",
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    lieu: event.lieu,
    public_cible: event.public_cible,
    image_url: event.image_url,
    contact_label: event.contact_label,
    contact_href: event.contact_href,
    lien_url: event.lien_url,
    piece_jointe_url: event.piece_jointe_url,
    visible_public: event.visible_public,
    published_at: null,
    scheduled_for: null,
    cancellation_message: null,
    recurrence_rule: event.recurrence_rule,
    parent_event_id: event.id,
    exception_date: event.exception_date,
    slug: null
  };

  return createEvent(copy);
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

  const { error } = await supabase
    .from("actualites")
    .update({ statut: "corbeille", visible_public: false, deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Actualité supprimée." };
}

export async function updateActualiteStatus(id: number, statut: "brouillon" | "publie" | "archive" | "corbeille") {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase
    .from("actualites")
    .update({
      statut,
      visible_public: statut === "publie",
      archived_at: statut === "archive" ? new Date().toISOString() : null,
      deleted_at: statut === "corbeille" ? new Date().toISOString() : null
    })
    .eq("id", id);

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Statut de l'actualite mis a jour." };
}

export async function deleteActualitePermanently(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").delete().eq("id", id).not("deleted_at", "is", null);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Actualite supprimee definitivement." };
}

export async function fetchVolants() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as VolantRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("volants").select("*").order("id", { ascending: true });
  return { data: (data ?? []) as VolantRow[], error: friendlyDatabaseError(error) };
}

export async function fetchPrivateDocuments() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as PrivateDocumentRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("documents_prives")
    .select("*")
    .eq("statut", "publie")
    .order("updated_at", { ascending: false });

  return { data: (data ?? []) as PrivateDocumentRow[], error: friendlyDatabaseError(error) };
}

export async function fetchPrivateDocumentsForManager() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as PrivateDocumentRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("documents_prives")
    .select("*")
    .order("updated_at", { ascending: false });

  return { data: (data ?? []) as PrivateDocumentRow[], error: friendlyDatabaseError(error) };
}

export async function createPrivateDocumentSignedUrl(document: Pick<PrivateDocumentRow, "bucket_name" | "file_path">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { url: null as string | null, error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.storage.from(document.bucket_name).createSignedUrl(document.file_path, 60);
  return { url: data?.signedUrl ?? null, error: friendlyDatabaseError(error) };
}

export async function uploadPrivateDocument(input: {
  file: File;
  titre: string;
  description?: string;
  categorie: string;
  auteur?: string;
  versionLabel?: string;
  allowedRoles: string[];
  statut: string;
}) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const titre = input.titre.trim();
  if (!titre) return { ok: false, message: "Le titre du document est obligatoire." };

  if (!isAllowedPrivateDocumentFile({ mimeType: input.file.type, sizeBytes: input.file.size })) {
    return { ok: false, message: "Fichier refusé : type non autorisé ou taille supérieure à 15 Mo." };
  }

  const safeName = sanitizePrivateDocumentFileName(input.file.name);
  if (!safeName) return { ok: false, message: "Nom de fichier invalide." };

  const bucketName = "cfvv-private-documents";
  const filePath = `${input.categorie}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(bucketName).upload(filePath, input.file, {
    cacheControl: "3600",
    upsert: false
  });

  if (upload.error) {
    return { ok: false, message: friendlyDatabaseError(upload.error) ?? "Le fichier n'a pas pu être téléversé." };
  }

  const { error } = await supabase.from("documents_prives").insert({
    titre,
    description: input.description?.trim() || null,
    categorie: input.categorie,
    bucket_name: bucketName,
    file_path: filePath,
    file_name: safeName,
    mime_type: input.file.type,
    size_bytes: input.file.size,
    auteur: input.auteur?.trim() || null,
    version_label: input.versionLabel?.trim() || null,
    allowed_roles: input.allowedRoles.length > 0 ? input.allowedRoles : ["member"],
    statut: input.statut
  });

  if (error) {
    await supabase.storage.from(bucketName).remove([filePath]);
  }

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Document ajouté au back-office." };
}

export async function updatePrivateDocument(id: number, input: Partial<PrivateDocumentRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("documents_prives").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Document mis à jour." };
}

export async function deletePrivateDocumentPermanently(document: Pick<PrivateDocumentRow, "id" | "bucket_name" | "file_path">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const remove = await supabase.storage.from(document.bucket_name).remove([document.file_path]);
  if (remove.error) {
    return { ok: false, message: friendlyDatabaseError(remove.error) ?? "Le fichier n'a pas pu être supprimé." };
  }

  const { error } = await supabase.from("documents_prives").delete().eq("id", document.id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Document supprimé définitivement." };
}

export async function fetchMediaAssetsForManager(search = "") {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as MediaAssetRow[], error: "Configuration Supabase manquante." };

  let query = supabase.from("media_assets").select("*").order("updated_at", { ascending: false });
  const cleanSearch = search.trim();
  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,file_name.ilike.%${cleanSearch}%,credit.ilike.%${cleanSearch}%`);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as MediaAssetRow[], error: friendlyDatabaseError(error) };
}

export async function uploadMediaAsset(input: {
  file: File;
  title: string;
  description?: string;
  altText?: string;
  credit?: string;
  informative: boolean;
  knownUsage?: string[];
  uploadedBy?: string | null;
}) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const validation = validateMediaAssetInput({
    fileName: input.file.name,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
    title: input.title,
    informative: input.informative,
    altText: input.altText
  });

  if (!validation.ok || !validation.kind) {
    return { ok: false, message: validation.issues.join(" ") || "Media refuse." };
  }

  const safeName = validation.cleanName || sanitizeMediaFileName(input.file.name);
  const filePath = `${validation.kind}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(mediaBucketName).upload(filePath, input.file, {
    cacheControl: "31536000",
    upsert: false
  });

  if (upload.error) {
    return { ok: false, message: friendlyDatabaseError(upload.error) ?? "Le media n'a pas pu etre televerse." };
  }

  const publicUrl = supabase.storage.from(mediaBucketName).getPublicUrl(filePath).data.publicUrl;
  const { error } = await supabase.from("media_assets").insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    bucket_name: mediaBucketName,
    file_path: filePath,
    file_name: safeName,
    public_url: publicUrl,
    mime_type: input.file.type,
    size_bytes: input.file.size,
    kind: validation.kind,
    alt_text: validation.kind === "image" ? input.altText?.trim() || null : null,
    credit: input.credit?.trim() || null,
    informative: input.informative,
    known_usage: input.knownUsage?.filter(Boolean) ?? [],
    status: "active",
    uploaded_by: input.uploadedBy ?? null
  });

  if (error) {
    await supabase.storage.from(mediaBucketName).remove([filePath]);
  }

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Media ajoute a la mediatheque." };
}

export async function updateMediaAsset(
  id: number,
  input: Partial<Pick<MediaAssetRow, "title" | "description" | "alt_text" | "credit" | "informative" | "known_usage" | "status">>
) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("media_assets").update(input).eq("id", id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Media mis a jour." };
}

export async function replaceMediaAssetFile(asset: MediaAssetRow, file: File) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const validation = validateMediaAssetInput({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    title: asset.title,
    informative: asset.informative,
    altText: asset.alt_text
  });

  if (!validation.ok || !validation.kind) {
    return { ok: false, message: validation.issues.join(" ") || "Nouveau fichier refuse." };
  }

  if (validation.kind !== asset.kind) {
    return { ok: false, message: "Le remplacement doit conserver le meme type de media." };
  }

  const safeName = validation.cleanName || sanitizeMediaFileName(file.name);
  const filePath = `${validation.kind}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(mediaBucketName).upload(filePath, file, {
    cacheControl: "31536000",
    upsert: false
  });

  if (upload.error) {
    return { ok: false, message: friendlyDatabaseError(upload.error) ?? "Le nouveau fichier n'a pas pu etre televerse." };
  }

  const publicUrl = supabase.storage.from(mediaBucketName).getPublicUrl(filePath).data.publicUrl;
  const { error } = await supabase
    .from("media_assets")
    .update({
      bucket_name: mediaBucketName,
      file_path: filePath,
      file_name: safeName,
      public_url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      kind: validation.kind
    })
    .eq("id", asset.id);

  if (error) {
    await supabase.storage.from(mediaBucketName).remove([filePath]);
    return { ok: false, message: friendlyDatabaseError(error) ?? "Le media n'a pas pu etre remplace." };
  }

  await supabase.storage.from(asset.bucket_name).remove([asset.file_path]);
  return { ok: true, message: "Fichier remplace." };
}

export async function deleteMediaAssetPermanently(asset: MediaAssetRow) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const allowed = canDeleteMediaAsset({ knownUsage: asset.known_usage, status: asset.status });
  if (!allowed.ok) return allowed;

  const remove = await supabase.storage.from(asset.bucket_name).remove([asset.file_path]);
  if (remove.error) {
    return { ok: false, message: friendlyDatabaseError(remove.error) ?? "Le fichier n'a pas pu etre supprime." };
  }

  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  return { ok: !error, message: friendlyDatabaseError(error) ?? "Media supprime definitivement." };
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

  const { data, error } = await supabase.from("settings_site").select("key, value, visibility").in("key", ["club", "contact", "bureau", "venue", "partners"]);

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

  const { data, error } = await supabase.from("profiles").select("id, prenom, nom, email, telephone, role, categorie, statut, licence_ffbad").order("nom");
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

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createInvitationToken() {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256Hex(value: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Le navigateur ne permet pas de générer une invitation sécurisée.");
  }

  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function normalizeInvitationRows(rows: MemberInvitationRow[]) {
  return rows.map((row) => ({
    ...row,
    roles: normalizeAppRoles(row.roles ?? legacyClubRoleToAppRoles(row.role))
  }));
}

export async function fetchMemberInvitations() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as MemberInvitationRow[], error: "Configuration Supabase manquante." };

  await supabase.rpc("mark_expired_member_invitations");

  const { data, error } = await supabase
    .from("member_invitations")
    .select("id, email, licence_ffbad, status, role, roles, expires_at, used_at, used_by, invited_by, revoked_at, metadata, created_at, updated_at")
    .order("created_at", { ascending: false });

  return { data: normalizeInvitationRows((data ?? []) as MemberInvitationRow[]), error: friendlyDatabaseError(error) };
}

export async function createMemberInvitations(rows: CsvImportRow[], origin: string, invitedBy?: string | null) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante.", links: [] as CreatedMemberInvitation[] };

  try {
    const expiresAt = getDefaultInvitationExpiration();
    const prepared = await Promise.all(
      rows.map(async (row) => {
        const token = createInvitationToken();
        const roles = normalizeAppRoles([row.role]);
        const legacyRole = appRolesToLegacyClubRole(roles);

        return {
          link: {
            email: row.email,
            prenom: row.prenom,
            nom: row.nom,
            activationUrl: buildActivationUrl(origin, token),
            expiresAt
          },
          payload: {
            email: row.email,
            licence_ffbad: row.licence_ffbad ?? null,
            token_hash: await sha256Hex(token),
            status: "pending" satisfies MemberInvitationStatus,
            role: legacyRole,
            roles,
            expires_at: expiresAt,
            invited_by: invitedBy ?? null,
            metadata: {
              prenom: row.prenom,
              nom: row.nom
            }
          }
        };
      })
    );

    const { error } = await supabase.from("member_invitations").insert(prepared.map((item) => item.payload));

    if (error) {
      return { ok: false, message: friendlyDatabaseError(error) ?? error.message, links: [] as CreatedMemberInvitation[] };
    }

    return {
      ok: true,
      message: `${prepared.length} invitation(s) créée(s). Copie les liens maintenant : ils ne seront pas réaffichés plus tard.`,
      links: prepared.map((item) => item.link)
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Création des invitations impossible.", links: [] as CreatedMemberInvitation[] };
  }
}

export async function revokeMemberInvitation(id: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase
    .from("member_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");

  return { ok: !error, message: friendlyDatabaseError(error) ?? "Invitation révoquée." };
}

export async function prepareMemberInvitationReminder(invitation: MemberInvitationRow, origin: string, invitedBy?: string | null) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante.", link: null as CreatedMemberInvitation | null };

  if (invitation.status !== "pending") {
    return { ok: false, message: "Seules les invitations en attente peuvent être relancées.", link: null as CreatedMemberInvitation | null };
  }

  const revoke = await revokeMemberInvitation(invitation.id);
  if (!revoke.ok) {
    return { ok: false, message: revoke.message, link: null as CreatedMemberInvitation | null };
  }

  try {
    const token = createInvitationToken();
    const expiresAt = getDefaultInvitationExpiration();
    const roles = normalizeAppRoles(invitation.roles);
    const reminderCount = (invitation.metadata?.reminder_count ?? 0) + 1;
    const prenom = invitation.metadata?.prenom ?? "";
    const nom = invitation.metadata?.nom ?? "";

    const { error } = await supabase.from("member_invitations").insert({
      email: invitation.email,
      licence_ffbad: invitation.licence_ffbad,
      token_hash: await sha256Hex(token),
      status: "pending" satisfies MemberInvitationStatus,
      role: appRolesToLegacyClubRole(roles),
      roles,
      expires_at: expiresAt,
      invited_by: invitedBy ?? null,
      metadata: {
        prenom,
        nom,
        reminder_of: invitation.id,
        reminder_count: reminderCount
      }
    });

    if (error) {
      return { ok: false, message: friendlyDatabaseError(error) ?? error.message, link: null };
    }

    return {
      ok: true,
      message: "Relance préparée. Copie le nouveau lien maintenant : il ne sera pas réaffiché plus tard.",
      link: {
        email: invitation.email,
        prenom,
        nom,
        activationUrl: buildActivationUrl(origin, token),
        expiresAt
      }
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Relance impossible.", link: null };
  }
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
