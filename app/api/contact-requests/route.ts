import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestTypes = new Set(["Séance d'essai", "Séance d’essai", "Inscription", "Créneaux", "Volants", "Interclubs", "Autre"]);

interface ContactRequestInput {
  nom?: unknown;
  email?: unknown;
  telephone?: unknown;
  typeDemande?: unknown;
  message?: unknown;
}

interface ContactRequestInsert {
  nom: string;
  email: string;
  telephone: string | null;
  type_demande: string;
  message: string;
  statut: "nouveau";
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactRequest(input: ContactRequestInput): { payload?: ContactRequestInsert; error?: string } {
  const nom = asText(input.nom);
  const email = asText(input.email).toLowerCase();
  const telephone = asText(input.telephone);
  const typeDemande = asText(input.typeDemande);
  const message = asText(input.message);

  if (nom.length < 2) {
    return { error: "Indiquez votre nom." };
  }

  if (!emailPattern.test(email)) {
    return { error: "Indiquez une adresse email valide." };
  }

  if (!requestTypes.has(typeDemande)) {
    return { error: "Choisissez un type de demande valide." };
  }

  if (message.length < 5) {
    return { error: "Écrivez un message un peu plus précis." };
  }

  if (telephone.length > 30) {
    return { error: "Le numéro de téléphone est trop long." };
  }

  if (message.length > 2000) {
    return { error: "Le message est trop long. Limitez-le à 2000 caractères." };
  }

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

export async function POST(request: Request) {
  let body: ContactRequestInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Le formulaire est incomplet." }, { status: 400 });
  }

  const validation = validateContactRequest(body);

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

  return NextResponse.json({
    ok: true,
    message: "Demande envoyée. Le club revient vers vous rapidement."
  });
}
