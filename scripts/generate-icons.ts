import sharp from "sharp"
import { mkdirSync } from "node:fs"

const OUT = "public/icons"
mkdirSync(OUT, { recursive: true })

// Boussole marine : fond carte marine, grille 4 zones (les 4 piliers),
// rose des vents or vibewiki au centre.
function compassIcon(rounded: boolean) {
  const rx = rounded ? 96 : 0
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#23385F"/>
      <stop offset="1" stop-color="#1E2D4F"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#bg)"/>
  <path d="M256 96 L256 416 M96 256 L416 256" stroke="#EEF0EA" stroke-opacity="0.14" stroke-width="5" fill="none"/>
  <path d="M150 106 L190 150 M106 150 L150 190 M362 106 L322 150 M406 150 L362 190 M150 406 L190 362 M106 362 L150 322 M362 406 L322 362 M406 362 L362 322" stroke="#EEF0EA" stroke-opacity="0.14" stroke-width="4"/>
  <circle cx="256" cy="256" r="152" fill="#D9A441" fill-opacity="0.10" stroke="#D9A441" stroke-width="12"/>
  <circle cx="256" cy="256" r="118" fill="none" stroke="#D9A441" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="4 10"/>
  <path d="M256 128 L288 224 L384 256 L288 288 L256 384 L224 288 L128 256 L224 224 Z" fill="#D9A441"/>
  <path d="M256 128 L256 384 M128 256 L384 256" stroke="#1E2D4F" stroke-width="6" fill="none" opacity="0.25"/>
  <circle cx="256" cy="256" r="24" fill="#1E2D4F" stroke="#D9A441" stroke-width="9"/>
  <circle cx="256" cy="256" r="6" fill="#D9A441"/>
</svg>`
}

// Version maskable : fond plein (sans coins arrondis), contenu dans la zone sûre (80%).
function maskableIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="bgm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#23385F"/>
      <stop offset="1" stop-color="#1E2D4F"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgm)"/>
  <path d="M256 136 L256 376 M136 256 L376 256" stroke="#EEF0EA" stroke-opacity="0.14" stroke-width="5" fill="none"/>
  <circle cx="256" cy="256" r="140" fill="#D9A441" fill-opacity="0.10" stroke="#D9A441" stroke-width="12"/>
  <circle cx="256" cy="256" r="108" fill="none" stroke="#D9A441" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="4 10"/>
  <path d="M256 148 L284 228 L364 256 L284 284 L256 364 L228 284 L148 256 L228 228 Z" fill="#D9A441"/>
  <circle cx="256" cy="256" r="22" fill="#1E2D4F" stroke="#D9A441" stroke-width="9"/>
  <circle cx="256" cy="256" r="6" fill="#D9A441"/>
</svg>`
}

await Promise.all([
  sharp(Buffer.from(compassIcon(true))).resize(192, 192).png().toFile(`${OUT}/icon-192.png`),
  sharp(Buffer.from(compassIcon(true))).resize(512, 512).png().toFile(`${OUT}/icon-512.png`),
  sharp(Buffer.from(compassIcon(false))).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`),
  sharp(Buffer.from(maskableIcon())).resize(192, 192).png().toFile(`${OUT}/icon-maskable-192.png`),
  sharp(Buffer.from(maskableIcon())).resize(512, 512).png().toFile(`${OUT}/icon-maskable-512.png`),
])

console.log("Icônes générées :")
for (const f of ["icon-192.png", "icon-512.png", "apple-touch-icon.png", "icon-maskable-192.png", "icon-maskable-512.png"]) {
  const st = await sharp(`${OUT}/${f}`).metadata()
  console.log(`  ${f} → ${st.width}x${st.height}, ${st.format}`)
}