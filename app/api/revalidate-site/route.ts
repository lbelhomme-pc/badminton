import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : requestOrigin;
  return origin === requestOrigin || origin === configuredOrigin;
}

export async function POST(request: Request) {
  if (!sameOriginAllowed(request)) {
    return NextResponse.json({ ok: false, message: "Origine non autorisée." }, { status: 403 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!token || !url || !anonKey) {
    return NextResponse.json({ ok: false, message: "Session administrateur manquante." }, { status: 401 });
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json({ ok: false, message: "Session administrateur invalide." }, { status: 401 });
  }

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", authData.user.id);
  const advancedRoles = (roleRows ?? []).map((row) => String(row.role));
  let authorized = advancedRoles.includes("admin") || advancedRoles.includes("super_admin");

  if (!authorized) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    authorized = profile?.role === "admin" || profile?.role === "bureau";
  }

  if (!authorized) {
    return NextResponse.json({ ok: false, message: "Droits administrateur requis." }, { status: 403 });
  }

  // Le layout contient le header et le footer. Son invalidation renouvelle aussi
  // les données publiques des pages qui utilisent les paramètres du club.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, message: "Le site public a été actualisé." });
}
