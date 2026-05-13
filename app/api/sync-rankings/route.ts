import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { parseRankingsCsv } from "@/lib/rankings/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV !== "production" && !secret) {
    return true;
  }

  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function playerKey(seed: string) {
  return createHash("sha256").update(seed.trim().toLowerCase()).digest("hex");
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const csvUrl = process.env.RANKINGS_CSV_URL;

  if (!supabaseUrl || !serviceRoleKey || !csvUrl) {
    return json(
      {
        success: false,
        error: "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou RANKINGS_CSV_URL."
      },
      { status: 500 }
    );
  }

  const response = await fetch(csvUrl, { cache: "no-store" });

  if (!response.ok) {
    return json({ success: false, error: `CSV inaccessible : ${response.status}` }, { status: 502 });
  }

  const csv = await response.text();
  const parsedRows = parseRankingsCsv(csv);

  if (parsedRows.length === 0) {
    return json({ success: false, error: "Aucune ligne de classement exploitable dans le CSV." }, { status: 422 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const syncRunId = randomUUID();
  const syncedAt = new Date().toISOString();

  const rows = parsedRows.map((row) => ({
    player_key: playerKey(row.playerKeySeed),
    display_name: row.displayName,
    categorie: row.categorie,
    classement_simple: row.classementSimple,
    classement_double: row.classementDouble,
    classement_mixte: row.classementMixte,
    points_simple: row.pointsSimple,
    points_double: row.pointsDouble,
    points_mixte: row.pointsMixte,
    progression: row.progression,
    equipe: row.equipe,
    visibility: "public",
    active: true,
    source: "csv",
    sync_run_id: syncRunId,
    synced_at: syncedAt
  }));

  const { error: upsertError } = await supabase.from("rankings").upsert(rows, { onConflict: "player_key" });

  if (upsertError) {
    return json({ success: false, error: upsertError.message }, { status: 500 });
  }

  const { error: inactiveError } = await supabase
    .from("rankings")
    .update({ active: false, synced_at: syncedAt })
    .eq("source", "csv")
    .neq("sync_run_id", syncRunId);

  if (inactiveError) {
    return json({ success: false, error: inactiveError.message }, { status: 500 });
  }

  return json({
    success: true,
    imported: rows.length,
    syncRunId,
    syncedAt
  });
}
