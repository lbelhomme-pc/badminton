import { mkdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const defaultPages = ["/", "/creneaux", "/tarifs", "/contact", "/connexion"];
const categories = ["performance", "accessibility", "best-practices", "seo"];
const baseUrl = cleanBaseUrl(process.env.LIGHTHOUSE_BASE_URL || "http://127.0.0.1:3000");
const pages = parsePages(process.env.LIGHTHOUSE_PAGES);
const outputRoot = path.resolve(process.env.LIGHTHOUSE_OUTPUT_DIR || "reports/lighthouse");
const lighthousePackage = process.env.LIGHTHOUSE_PACKAGE || "lighthouse@12.6.1";
const timeoutMs = Number(process.env.LIGHTHOUSE_TIMEOUT_MS || 180000);
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = path.join(outputRoot, runId);

main().catch((error) => {
  console.error("");
  console.error("Audit Lighthouse impossible.");
  console.error(error instanceof Error ? error.message : String(error));
  console.error("");
  console.error("Verifie qu'un serveur local tourne, par exemple :");
  console.error("  npm run build");
  console.error("  npm run start");
  console.error("");
  console.error("Si Lighthouse n'est pas installe localement, le script utilise npx avec :");
  console.error(`  ${lighthousePackage}`);
  process.exit(1);
});

async function main() {
  await assertServerAvailable();
  await mkdir(outputDir, { recursive: true });
  process.env.TMP = outputDir;
  process.env.TEMP = outputDir;

  const lighthouse = await getLighthouseCommand();
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Pages: ${pages.join(", ")}`);
  console.log(`Sortie: ${outputDir}`);
  console.log(`Commande Lighthouse: ${lighthouse.label}`);
  console.log("");

  const results = [];

  for (const page of pages) {
    const url = new URL(page, `${baseUrl}/`).toString();
    const fileName = fileNameForPage(page);
    const outputPath = path.join(outputDir, `${fileName}.json`);
    const chromeProfilePath = path.join(outputDir, `${fileName}-chrome-profile`);
    await mkdir(chromeProfilePath, { recursive: true });

    process.stdout.write(`Audit ${page} ... `);
    await runLighthouse(lighthouse, url, outputPath, chromeProfilePath);
    const result = await readScores(outputPath);
    results.push({ page, url, outputPath, ...result });
    console.log(formatScores(result.scores));
  }

  console.log("");
  console.log("Resume Lighthouse");
  console.table(
    results.map((result) => ({
      page: result.page,
      performance: result.scores.performance,
      accessibility: result.scores.accessibility,
      bestPractices: result.scores["best-practices"],
      seo: result.scores.seo
    }))
  );
}

function cleanBaseUrl(value) {
  return value.trim().replace(/\/+$/, "");
}

function parsePages(value) {
  if (!value) return defaultPages;
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("/") ? item : `/${item}`));

  return parsed.length > 0 ? parsed : defaultPages;
}

async function assertServerAvailable() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${baseUrl}/`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Le serveur repond avec le statut ${response.status} sur ${baseUrl}/`);
    }
  } catch (error) {
    throw new Error(`Aucun serveur joignable sur ${baseUrl}. Lance le site avant l'audit.`);
  } finally {
    clearTimeout(timeout);
  }
}

async function getLighthouseCommand() {
  const localBin = process.platform === "win32"
    ? path.resolve("node_modules/.bin/lighthouse.cmd")
    : path.resolve("node_modules/.bin/lighthouse");

  if (existsSync(localBin)) {
    return {
      command: localBin,
      baseArgs: [],
      label: "lighthouse local"
    };
  }

  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

  return {
    command: npxCommand,
    baseArgs: ["--yes", lighthousePackage],
    label: `${npxCommand} --yes ${lighthousePackage}`
  };
}

function fileNameForPage(page) {
  if (page === "/") return "home";
  return page.replace(/^\/+/, "").replace(/[^a-z0-9-]+/gi, "-").replace(/-+$/g, "") || "page";
}

async function runLighthouse(lighthouse, url, outputPath, chromeProfilePath) {
  const args = [
    ...lighthouse.baseArgs,
    url,
    "--quiet",
    "--output=json",
    `--output-path=${outputPath}`,
    `--only-categories=${categories.join(",")}`,
    "--form-factor=mobile",
    "--screenEmulation.mobile=true",
    "--screenEmulation.width=375",
    "--screenEmulation.height=812",
    "--screenEmulation.deviceScaleFactor=2.625",
    `--chrome-flags=--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage --user-data-dir=${chromeProfilePath}`
  ];

  let commandError = null;

  try {
    await runCommand(lighthouse.command, args, timeoutMs);
  } catch (error) {
    commandError = error;
  }

  const report = await stat(outputPath).catch(() => null);

  if (!report?.isFile()) {
    if (commandError) {
      throw commandError;
    }

    throw new Error(`Le rapport Lighthouse n'a pas ete cree : ${outputPath}`);
  }

  if (commandError && !isWindowsCleanupWarning(commandError)) {
    throw commandError;
  }
}

function isWindowsCleanupWarning(error) {
  const message = error instanceof Error ? error.message : String(error);
  return process.platform === "win32" && message.includes("EPERM") && message.includes("lighthouse.");
}

function runCommand(command, args, timeout) {
  return new Promise((resolve, reject) => {
    const invocation = createInvocation(command, args);
    const child = spawn(invocation.command, invocation.args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      windowsHide: true,
      env: createChildEnv()
    });

    let stderr = "";
    let stdout = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Timeout apres ${Math.round(timeout / 1000)}s pour ${command}.`));
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }

      const details = [stderr.trim(), stdout.trim()].filter(Boolean).join("\n");
      reject(new Error(details || `${command} a quitte avec le code ${code}.`));
    });
  });
}

function createChildEnv() {
  const env = { ...process.env };
  const major = Number(process.versions.node.split(".")[0]);

  if (process.platform === "win32" && major >= 24 && !env.NODE_OPTIONS?.includes("--use-system-ca")) {
    env.NODE_OPTIONS = [env.NODE_OPTIONS, "--use-system-ca"].filter(Boolean).join(" ");
  }

  return env;
}

function createInvocation(command, args) {
  if (process.platform !== "win32") {
    return { command, args };
  }

  return {
    command: "cmd.exe",
    args: ["/d", "/c", [quoteCommandForCmd(command), ...args.map(quoteForCmd)].join(" ")]
  };
}

function quoteCommandForCmd(value) {
  const command = String(value);
  return /[\s&()]/.test(command) ? quoteForCmd(command) : command;
}

function quoteForCmd(value) {
  const text = String(value);
  return /[\s&()]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function readScores(outputPath) {
  const content = await readFile(outputPath, "utf8");
  const report = JSON.parse(content);
  const scores = Object.fromEntries(
    categories.map((category) => {
      const score = report.categories?.[category]?.score;
      return [category, score == null ? "n/a" : Math.round(score * 100)];
    })
  );

  return { scores };
}

function formatScores(scores) {
  return categories.map((category) => `${category}: ${scores[category]}`).join(" | ");
}
