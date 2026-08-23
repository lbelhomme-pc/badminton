import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:3000";
const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS || 60_000);
const sourceRoots = ["app", "components", "lib"];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function routeFromPage(filePath) {
  const relative = path.relative(path.join(cwd, "app"), filePath).replaceAll("\\", "/");
  if (!relative.endsWith("/page.tsx") && relative !== "page.tsx") return null;
  if (relative.includes("[")) return null;
  const route = relative.replace(/\/?page\.tsx$/, "");
  return route ? `/${route}` : "/";
}

function sourceHrefValues() {
  const values = new Set();
  const matcher = /\bhref\s*(?:=|:)\s*\{?\s*["'`]([^"'`{}]+)["'`]/g;

  for (const root of sourceRoots) {
    for (const filePath of walk(path.join(cwd, root)).filter((file) => /\.(ts|tsx)$/.test(file))) {
      const source = fs.readFileSync(filePath, "utf8");
      for (const match of source.matchAll(matcher)) {
        if (!match[1].includes("${")) values.add(match[1]);
      }
    }
  }
  return values;
}

function renderedHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((match) =>
    match[1].replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"')
  );
}

function classifyHref(href) {
  if (
    !href ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:") ||
    href.startsWith("data:")
  ) {
    return { kind: "ignored" };
  }
  if (href.startsWith("#")) return { kind: "fragment", fragment: href.slice(1) };

  try {
    const url = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    const isLocalAlias = localHosts.has(url.hostname) && localHosts.has(base.hostname);
    if (url.origin === base.origin || isLocalAlias) {
      if (isLocalAlias) {
        url.protocol = base.protocol;
        url.hostname = base.hostname;
        url.port = base.port;
      }
      return { kind: "internal", url };
    }
    return { kind: "external", url };
  } catch {
    return { kind: "invalid" };
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function mapConcurrent(values, concurrency, task) {
  const queue = [...values];
  const results = [];
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const value = queue.shift();
        results.push(await task(value));
      }
    })
  );
  return results;
}

const pageRoutes = walk(path.join(cwd, "app")).map(routeFromPage).filter(Boolean).sort();
const brokenPages = [];
const pageHtml = new Map();

console.log(`Audit de ${pageRoutes.length} pages sur ${baseUrl}...`);
await mapConcurrent(pageRoutes, 5, async (route) => {
  try {
    const response = await fetchWithTimeout(new URL(route, baseUrl));
    const html = await response.text();
    pageHtml.set(route, html);
    if (!response.ok) brokenPages.push({ route, status: response.status });
  } catch (error) {
    brokenPages.push({ route, status: error instanceof Error ? error.message : String(error) });
  }
});

const internalTargets = new Map();
const externalTargets = new Set();
const invalidLinks = [];
const brokenFragments = [];

function collect(href, source, html = "") {
  const classified = classifyHref(href);
  if (classified.kind === "ignored") return;
  if (classified.kind === "invalid") {
    invalidLinks.push({ href, source });
    return;
  }
  if (classified.kind === "fragment") {
    if (html && !new RegExp(`\\bid=["']${classified.fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(html)) {
      brokenFragments.push({ href, source });
    }
    return;
  }
  if (classified.kind === "external") {
    externalTargets.add(classified.url.href);
    return;
  }

  classified.url.hash = "";
  const target = classified.url.href;
  if (!internalTargets.has(target)) internalTargets.set(target, new Set());
  internalTargets.get(target).add(source);
}

for (const [route, html] of pageHtml) {
  for (const href of renderedHrefs(html)) collect(href, route, html);
}
for (const href of sourceHrefValues()) collect(href, "code source");

const brokenTargets = [];
await mapConcurrent([...internalTargets.keys()], 6, async (target) => {
  try {
    const response = await fetchWithTimeout(target);
    await response.body?.cancel();
    if (!response.ok) brokenTargets.push({ target, status: response.status, sources: [...internalTargets.get(target)] });
  } catch (error) {
    brokenTargets.push({
      target,
      status: error instanceof Error ? error.message : String(error),
      sources: [...internalTargets.get(target)]
    });
  }
});

console.log(`Pages testées : ${pageRoutes.length}`);
console.log(`Liens internes uniques testés : ${internalTargets.size}`);
console.log(`Liens externes uniques à contrôler : ${externalTargets.size}`);
console.log("EXTERNAL_LINKS=" + JSON.stringify([...externalTargets].sort()));

const failures = [
  ...brokenPages.map((item) => ({ type: "page", ...item })),
  ...brokenTargets.map((item) => ({ type: "lien", ...item })),
  ...brokenFragments.map((item) => ({ type: "ancre", ...item })),
  ...invalidLinks.map((item) => ({ type: "URL invalide", ...item }))
];

if (failures.length > 0) {
  console.error("ECHECS=" + JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log("Tous les liens internes, fichiers et ancres contrôlés répondent correctement.");
}
