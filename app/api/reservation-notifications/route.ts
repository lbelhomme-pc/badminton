import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface NotificationInput {
  creneauId?: unknown;
  dateReservation?: unknown;
}

interface CreneauDetails {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  gymnase: string;
  type: string;
}

function html(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function envRecipients() {
  return (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: Request) {
  if (process.env.RESERVATION_EMAIL_NOTIFICATIONS_ENABLED !== "true") {
    return NextResponse.json({ ok: true, notified: false, message: "Notifications email désactivées par le club." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ ok: false, message: "Configuration serveur Supabase incomplète." }, { status: 503 });
  }

  const token = bearerToken(request);
  if (!token) return NextResponse.json({ ok: false, message: "Authentification requise." }, { status: 401 });

  let body: NotificationInput;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, message: "Demande invalide." }, { status: 400 }); }
  const creneauId = Number(body.creneauId);
  const dateReservation = typeof body.dateReservation === "string" ? body.dateReservation : "";
  if (!Number.isInteger(creneauId) || !/^\d{4}-\d{2}-\d{2}$/.test(dateReservation)) {
    return NextResponse.json({ ok: false, message: "Créneau ou date invalide." }, { status: 400 });
  }

  const authClient = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ ok: false, message: "Session invalide." }, { status: 401 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: reservation } = await adminClient
    .from("reservations")
    .select("id, user_id, date_reservation, statut, created_at, creneaux(id, jour, heure_debut, heure_fin, gymnase, type)")
    .eq("user_id", authData.user.id)
    .eq("creneau_id", creneauId)
    .eq("date_reservation", dateReservation)
    .eq("statut", "confirmee")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!reservation) return NextResponse.json({ ok: false, message: "Réservation confirmée introuvable." }, { status: 404 });
  const creneauRaw = reservation.creneaux as unknown as CreneauDetails | CreneauDetails[] | null;
  const creneau = Array.isArray(creneauRaw) ? creneauRaw[0] : creneauRaw;
  if (!creneau || !["mercredi", "vendredi"].includes(creneau.jour.toLowerCase())) {
    return NextResponse.json({ ok: true, notified: false, message: "Notification non requise pour ce jour." });
  }

  const { data: profile } = await adminClient.from("profiles").select("prenom, nom, email, licence_ffbad").eq("id", authData.user.id).maybeSingle();
  const recipientSet = new Set(envRecipients());
  const [{ data: roleRows }, { data: legacyAdmins }] = await Promise.all([
    adminClient.from("user_roles").select("user_id").in("role", ["admin", "super_admin"]),
    adminClient.from("profiles").select("id, email").eq("role", "admin")
  ]);
  const adminIds = [...new Set([...(roleRows ?? []).map((row) => row.user_id), ...(legacyAdmins ?? []).map((row) => row.id)])];
  if (adminIds.length > 0) {
    const { data: adminProfiles } = await adminClient.from("profiles").select("email").in("id", adminIds);
    (adminProfiles ?? []).forEach((row) => { if (row.email) recipientSet.add(row.email.toLowerCase()); });
  }
  const recipients = [...recipientSet].filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!resendApiKey || !fromEmail || recipients.length === 0) {
    return NextResponse.json({ ok: true, notified: false, message: "Réservation enregistrée ; service email à configurer." }, { status: 202 });
  }

  const { error: lockError } = await adminClient.from("reservation_email_notifications").insert({
    reservation_id: reservation.id,
    recipients
  });
  if (lockError?.code === "23505") return NextResponse.json({ ok: true, notified: false, message: "Notification déjà envoyée." });

  const memberName = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || profile?.email || authData.user.email || "Un licencié";
  const subject = `Nouvelle réservation CFVV · ${creneau.jour} ${dateReservation}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject,
      html: `<h2>Nouvelle réservation au CFVV</h2><p><strong>${html(memberName)}</strong> vient de réserver un créneau.</p><ul><li>Jour : ${html(creneau.jour)}</li><li>Date : ${html(dateReservation)}</li><li>Horaire : ${html(creneau.heure_debut.slice(0, 5))}–${html(creneau.heure_fin.slice(0, 5))}</li><li>Lieu : ${html(creneau.gymnase)}</li><li>Type : ${html(creneau.type)}</li><li>Licence : ${html(profile?.licence_ffbad || "non renseignée")}</li></ul>`
    })
  });

  if (!response.ok) {
    if (!lockError) await adminClient.from("reservation_email_notifications").delete().eq("reservation_id", reservation.id);
    return NextResponse.json({ ok: false, message: "L’email administrateur n’a pas pu être envoyé." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, notified: true, message: "Administrateurs prévenus par email." });
}
