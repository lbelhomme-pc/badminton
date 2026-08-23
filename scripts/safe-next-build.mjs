import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const devPort = Number(process.env.PORT || 3000);

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (open) => {
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

if (!process.env.CI && !process.env.VERCEL && await isPortOpen(devPort)) {
  console.error(
    `Compilation annulée : le serveur local utilise déjà le port ${devPort}.\n` +
    "Arrête d'abord `npm run dev`, puis relance `npm run build`. Cela protège le cache Next.js contre les erreurs Webpack."
  );
  process.exit(1);
}

const nextCli = new URL("../node_modules/next/dist/bin/next", import.meta.url);
const child = spawn(process.execPath, [fileURLToPath(nextCli), "build"], {
  stdio: "inherit",
  env: process.env
});

child.once("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
