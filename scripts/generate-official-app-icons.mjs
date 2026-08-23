import sharp from "sharp";

const source = "public/logos/cfvv-horizontal.png";

async function createIcon(size, destination) {
  const radius = Math.round(size * 0.22);
  const padding = Math.max(2, Math.round(size * 0.09));
  const croppedLogo = await sharp(source)
    // Partie droite du logo officiel : CFVV Vendôme 41, sans le château.
    .extract({ left: 570, top: 55, width: 481, height: 230 })
    .png()
    .toBuffer();
  const logo = await sharp(croppedLogo)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({
      width: size - padding * 2,
      height: size - padding * 2,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const background = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#F7F9F7"/>
      <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${Math.max(1, radius - 1)}" fill="none" stroke="#D9E5E8" stroke-width="${Math.max(1, Math.round(size * 0.008))}"/>
    </svg>
  `);

  await sharp(background)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(destination);
}

await Promise.all([
  createIcon(32, "public/icons/favicon-32-v3.png"),
  createIcon(180, "public/icons/apple-touch-icon-v3.png"),
  createIcon(192, "public/icons/pwa-icon-192-v3.png"),
  createIcon(512, "public/icons/pwa-icon-512-v3.png")
]);

console.log("Icônes CFVV officielles générées sans le château.");
