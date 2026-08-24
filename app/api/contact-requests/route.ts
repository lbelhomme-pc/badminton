import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { escapeEmailHtml, sendAdminNotificationEmail } from "@/lib/server-email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestTypes = new Set(["Séance d'essai", "Inscription", "Créneaux", "Volants", "Interclubs", "Partenariat", "Autre"]);
const maxBodySize = 8_000;
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 5;
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

interface ContactRequestInput {
  consentRgpd?: unknown;
  email?: unknown;
  message?: unknown;
  nom?: unknown;
  telephone?: unknown;
  typeDemande?: unknown;
  website?: unknown;
}

interface ContactRequestInsert {
  email: string;
  message: string;
  nom: string;
  statut: "nouveau";
  telephone: string | null;
  type_demande: string;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function contactEmailHtml(payload: ContactRequestInsert) {
  return [
    "<h2>Nouveau message depuis le site CFVV</h2>",
    "<ul>",
    `<li><strong>Nom :</strong> ${escapeEmailHtml(payload.nom)}</li>`,
    `<li><strong>Email :</strong> ${escapeEmailHtml(payload.email)}</li>`,
    `<li><strong>Téléphone :</strong> ${escapeEmailHtml(payload.telephone || "Non renseigné")}</li>`,
    `<li><strong>Objet :</strong> ${escapeEmailHtml(payload.type_demande)}</li>`,
    "</ul>",
    `<p><strong>Message :</strong></p><p>${escapeEmailHtml(payload.message).replace(/\n/g, "<br>")}</p>`
  ].join("");
}

function validateContactRequest(input: ContactRequestInput): { payload?: ContactRequestInsert; error?: string; spam?: boolean } {
  if (asText(input.website).length > 0) {
    return { spam: true };
  }

  const nom = asText(input.nom);
  const email = asText(input.email).toLowerCase();
  const telephone = asText(input.telephone);
  const typeDemande = asText(input.typeDemande);
  const message = asText(input.message);

  if (nom.length < 2) return { error: "Indiquez votre nom." };
  if (!emailPattern.test(email)) return { error: "Indiquez une adresse email valide." };
  if (!requestTypes.has(typeDemande)) return { error: "Choisissez un objet de demande valide." };
  if (message.length < 5) return { error: "Écrivez un message un peu plus précis." };
  if (telephone.length > 30) return { error: "Le numéro de téléphone est trop long." };
  if (message.length > 2000) return { error: "Le message est trop long. Limitez-le à 2000 caractères." };
  if (input.consentRgpd !== true) return { error: "Confirmez l'envoi de vos informations au club." };

  return {
    payload: {
      nom,
      email,
      telephone: telephone || null,
      type_demande: typeDemande,
      message,
      statut: "nouveau"
    }
  };
}

function supabaseErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("contact_requests") || lower.includes("schema cache") || lower.includes("does not exist")) {
    return "Le formulaire n'est pas encore relié à Supabase. Applique la migration contact_requests puis réessaie.";
  }

  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return "La base refuse l'enregistrement de la demande. Vérifie les règles RLS de contact_requests.";
  }

  return "La demande n'a pas pu être enregistrée. Réessaie dans quelques instants.";
}

function sameOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : requestOrigin;
  return origin === requestOrigin || origin === configuredOrigin;
}

function rateLimitKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = contactRateLimit.get(key);

  if (!current || current.resetAt <= now) {
    contactRateLimit.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (current.count >= rateLimitMaxRequests) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  let body: ContactRequestInput;

  if (!sameOriginAllowed(request)) {
    return NextResponse.json({ ok: false, message: "Origine de la demande non autorisée." }, { status: 403 });
  }

  const key = rateLimitKey(request);
  if (!checkRateLimit(key)) {
    return NextResponse.json({ ok: false, message: "Trop de demandes envoyées. Réessayez dans quelques minutes." }, { status: 429 });
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > maxBodySize) {
      return NextResponse.json({ ok: false, message: "Le formulaire est trop long." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "Le formulaire est incomplet." }, { status: 400 });
  }

  const validation = validateContactRequest(body);

  if (validation.spam) {
    return NextResponse.json({ ok: true, message: "Demande envoyée. Le club revient vers vous rapidement." });
  }

  if (!validation.payload) {
    return NextResponse.json({ ok: false, message: validation.error ?? "Le formulaire est incomplet." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, message: "Le formulaire n'est pas encore relié à Supabase. Contacte le club directement." },
      { status: 503 }
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { error } = await supabase.from("contact_requests").insert(validation.payload);

  if (error) {
    return NextResponse.json({ ok: false, message: supabaseErrorMessage(error.message) }, { status: 500 });
  }

  const notification = await sendAdminNotificationEmail({
    subject: `Nouveau contact CFVV · ${validation.payload.type_demande}`,
    html: contactEmailHtml(validation.payload)
  });

  return NextResponse.json({
    ok: true,
    message: notification.sent
      ? "Demande envoyée. Le club revient vers vous rapidement."
      : `Demande enregistrée. La notification email n'a pas été envoyée : ${notification.message}`
  });
}
