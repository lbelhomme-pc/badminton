import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

export interface ProfileRow {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  role: string;
  categorie: string | null;
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
  return { data: (data ?? []) as CreneauRow[], error: error?.message ?? null };
}

export async function createCreneau(input: Omit<CreneauRow, "id">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("creneaux").insert(input);
  return { ok: !error, message: error?.message ?? "Créneau créé." };
}

export async function updateCreneau(id: number, input: Partial<CreneauRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("creneaux").update(input).eq("id", id);
  return { ok: !error, message: error?.message ?? "Créneau mis à jour." };
}

export async function fetchMyReservations() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ReservationRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("reservations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: true });

  return { data: (data ?? []) as ReservationRow[], error: error?.message ?? null };
}

export async function fetchAllReservations() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ReservationRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase
    .from("reservations")
    .select("*, creneaux(*)")
    .order("date_reservation", { ascending: false });

  return { data: (data ?? []) as ReservationRow[], error: error?.message ?? null };
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

  return { ok: !error, message: error?.message ?? "Réservation confirmée." };
}

export async function updateReservationStatus(id: number, statut: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("reservations").update({ statut }).eq("id", id);
  return { ok: !error, message: error?.message ?? "Réservation mise à jour." };
}

export async function fetchActualites(includeInternal = false) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ActualiteRow[], error: "Configuration Supabase manquante." };

  let query = supabase.from("actualites").select("*").order("published_at", { ascending: false });
  if (!includeInternal) {
    query = query.eq("visible_public", true);
  }

  const { data, error } = await query;
  return { data: (data ?? []) as ActualiteRow[], error: error?.message ?? null };
}

export async function createActualite(input: { titre: string; contenu: string; visible_public: boolean; auteur_id?: string }) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").insert(input);
  return { ok: !error, message: error?.message ?? "Actualité créée." };
}

export async function deleteActualite(id: number) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("actualites").delete().eq("id", id);
  return { ok: !error, message: error?.message ?? "Actualité supprimée." };
}

export async function fetchVolants() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as VolantRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("volants").select("*").order("id", { ascending: true });
  return { data: (data ?? []) as VolantRow[], error: error?.message ?? null };
}

export async function createVolant(input: Omit<VolantRow, "id">) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("volants").insert(input);
  return { ok: !error, message: error?.message ?? "Volant ajouté." };
}

export async function updateVolant(id: number, input: Partial<VolantRow>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { ok: false, message: "Configuration Supabase manquante." };

  const { error } = await supabase.from("volants").update(input).eq("id", id);
  return { ok: !error, message: error?.message ?? "Volant mis à jour." };
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

  return { ok: !error, message: error?.message ?? "Commande envoyée. Le stock a été mis à jour." };
}

export async function fetchProfiles() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { data: [] as ProfileRow[], error: "Configuration Supabase manquante." };

  const { data, error } = await supabase.from("profiles").select("id, prenom, nom, email, telephone, role, categorie").order("nom");
  return { data: (data ?? []) as ProfileRow[], error: error?.message ?? null };
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

  return { data: (data ?? []) as RankingRow[], error: error?.message ?? null };
}
