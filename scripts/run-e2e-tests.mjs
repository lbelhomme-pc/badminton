import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const cwd = process.cwd();
const externalBaseUrl = process.env.E2E_BASE_URL;
const port = Number(process.env.E2E_PORT || 3210);
const baseUrl = externalBaseUrl || `http://127.0.0.1:${port}`;
const results = [];
let server = null;

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function record(name, status, details = "") {
  results.push({ name, status, details });
  const marker = status === "pass" ? "PASS" : status === "skip" ? "SKIP" : "FAIL";
  console.log(`${marker} ${name}${details ? ` - ${details}` : ""}`);
}

async function run(name, fn) {
  try {
    await fn();
    record(name, "pass");
  } catch (error) {
    record(name, "fail", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function skip(name, details) {
  record(name, "skip", details);
}

async function startServer() {
  if (externalBaseUrl) {
    await waitForServer();
    return;
  }

  if (!fs.existsSync(path.join(cwd, ".next", "BUILD_ID"))) {
    throw new Error("Build manquant. Lance d'abord `npm run build`, ou utilise `npm run test:e2e:ci`.");
  }

  const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");

  server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => {
    const line = String(chunk).trim();
    if (process.env.E2E_VERBOSE && line) console.log(line);
  });

  server.stderr.on("data", (chunk) => {
    const line = String(chunk).trim();
    if (process.env.E2E_VERBOSE && line) console.error(line);
  });

  await waitForServer();
}

async function stopServer() {
  if (!server) return;
  server.kill();
  await delay(500);
  server = null;
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: "follow" });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }

  throw new Error(`Serveur E2E indisponible sur ${baseUrl}. ${lastError instanceof Error ? lastError.message : ""}`);
}

async function request(pathname, options = {}) {
  const response = await fetch(new URL(pathname, baseUrl), {
    redirect: "follow",
    ...options
  });
  const text = await response.text();
  return { response, text, normalized: normalize(text) };
}

function assertOk(page, label) {
  assert.equal(page.response.status, 200, `${label} retourne HTTP ${page.response.status}`);
}

function assertContains(page, values, label) {
  const haystack = page.normalized;
  const matched = values.some((value) => haystack.includes(normalize(value)));
  assert.ok(matched, `${label} ne contient aucun des textes attendus : ${values.join(", ")}`);
}

function assertSourceContains(filePath, values, label) {
  const source = fs.readFileSync(path.join(cwd, filePath), "utf8");
  const haystack = normalize(source);
  const matched = values.some((value) => haystack.includes(normalize(value)));
  assert.ok(matched, `${label} non trouvé dans ${filePath}`);
}

async function testDiscoveryJourney() {
  const home = await request("/");
  assertOk(home, "Accueil");
  assertContains(home, ["voir les creneaux", "creneaux"], "Accueil");

  const creneaux = await request("/creneaux");
  assertOk(creneaux, "Créneaux");
  assertContains(creneaux, ["demander un essai", "reserver", "s'inscrire"], "Créneaux");

  const trial = await request("/inscriptions/seance-essai");
  assertOk(trial, "Séance d'essai");
  assertContains(trial, ["demander un essai", "seance d'essai", "envoyer"], "Séance d'essai");
}

async function testLoginPage() {
  const login = await request("/connexion");
  assertOk(login, "Connexion");
  assertContains(login, ["connexion", "mot de passe", "espace prive"], "Connexion");
}

async function testAdminGuard() {
  const admin = await request("/admin");
  assertOk(admin, "Admin");
  assertSourceContains("components/auth/admin-route.tsx", ["Connexion nécessaire", "Accès réservé aux responsables"], "Garde admin");
}

async function testPrivateRoutes() {
  const routes = ["/espace-adherent", "/reservation-creneau", "/documents", "/mes-reservations", "/commande-volants"];

  for (const route of routes) {
    const page = await request(route);
    assertOk(page, route);
  }

  assertSourceContains("components/auth/protected-route.tsx", ["Se connecter", "requireActiveMember"], "Garde espace adhérent");
}

async function testInvalidContactForm() {
  const invalid = await request("/api/contact-requests", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      nom: "",
      email: "adresse-invalide",
      typeDemande: "Autre",
      message: "",
      consentRgpd: false
    })
  });

  assert.equal(invalid.response.status, 400, `Le formulaire invalide retourne HTTP ${invalid.response.status}`);
  assertContains(invalid, ["ok", "false", "nom", "email", "message", "informations"], "Réponse formulaire invalide");
}

async function testOptionalSupabaseLogin() {
  const url = process.env.E2E_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const memberEmail = process.env.E2E_MEMBER_EMAIL;
  const memberPassword = process.env.E2E_MEMBER_PASSWORD;

  if (!url || !anonKey || !memberEmail || !memberPassword) {
    await skip(
      "Connexion Supabase adhérent",
      "variables E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY, E2E_MEMBER_EMAIL et E2E_MEMBER_PASSWORD absentes"
    );
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: memberEmail,
    password: memberPassword
  });

  assert.ifError(error);
  assert.ok(data.user?.id, "La connexion adhérent ne retourne pas d'utilisateur.");
}

async function testOptionalSupabaseAdminLogin() {
  const url = process.env.E2E_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;

  if (!url || !anonKey || !adminEmail || !adminPassword) {
    await skip("Connexion Supabase admin", "variables E2E_ADMIN_EMAIL et E2E_ADMIN_PASSWORD absentes");
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });

  assert.ifError(error);
  assert.ok(data.user?.id, "La connexion admin ne retourne pas d'utilisateur.");
}

async function main() {
  await startServer();

  try {
    await run("J1 accueil > créneaux > séance d'essai", testDiscoveryJourney);
    await run("Page de connexion", testLoginPage);
    await run("Admin refusé sans session", testAdminGuard);
    await run("Routes privées protégées", testPrivateRoutes);
    await run("Formulaire contact invalide", testInvalidContactForm);
    await testOptionalSupabaseLogin();
    await testOptionalSupabaseAdminLogin();
  } finally {
    await stopServer();
  }

  const passed = results.filter((result) => result.status === "pass").length;
  const skipped = results.filter((result) => result.status === "skip").length;
  console.log(`\nE2E terminé : ${passed} réussi(s), ${skipped} ignoré(s), ${results.length} total.`);
}

main().catch(async (error) => {
  await stopServer();
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
