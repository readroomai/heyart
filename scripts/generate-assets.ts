/**
 * Generates every static brand asset from one source mark, so the favicon,
 * the app icon and the Open Graph card can never drift apart.
 *
 *   npm run assets
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')
const BRAND = join(PUBLIC, 'brand')

const INK = '#111111'
const IVORY = '#F6F2EA'
const CORAL = '#F26445'

function iconSvg(colour: string, background?: string, size = 24) {
  const bg = background ? `<rect width="24" height="24" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
  ${bg}
  <path d="M3.25 8.5V3.25H8.5" stroke="${colour}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
  <path d="M20.75 15.5V20.75H15.5" stroke="${colour}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
  <path d="M15.5 3.25h5.25V8.5" stroke="${colour}" stroke-width="1.7" fill="none" opacity="0.28"/>
  <path d="M8.5 20.75H3.25V15.5" stroke="${colour}" stroke-width="1.7" fill="none" opacity="0.28"/>
  <circle cx="12" cy="12" r="2.6" fill="${colour}"/>
</svg>`
}

function wordmarkSvg(colour: string, background?: string) {
  const bg = background ? `<rect width="220" height="48" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" width="220" height="48">
  ${bg}
  <g transform="translate(4 12)">
    <path d="M3.25 8.5V3.25H8.5" stroke="${colour}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
    <path d="M20.75 15.5V20.75H15.5" stroke="${colour}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
    <path d="M15.5 3.25h5.25V8.5" stroke="${colour}" stroke-width="1.7" fill="none" opacity="0.28"/>
    <path d="M8.5 20.75H3.25V15.5" stroke="${colour}" stroke-width="1.7" fill="none" opacity="0.28"/>
    <circle cx="12" cy="12" r="2.6" fill="${colour}"/>
  </g>
  <text x="38" y="31" font-family="Geist, Helvetica, Arial, sans-serif" font-size="24"
    font-weight="500" letter-spacing="-0.5" fill="${colour}">hiart</text>
</svg>`
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${IVORY}"/>
  <g stroke="rgba(17,17,17,0.07)" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join('')}
  </g>
  <g transform="translate(80 70) scale(1.5)">
    <path d="M3.25 8.5V3.25H8.5" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
    <path d="M20.75 15.5V20.75H15.5" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="square"/>
    <path d="M15.5 3.25h5.25V8.5" stroke="${INK}" stroke-width="1.7" fill="none" opacity="0.28"/>
    <path d="M8.5 20.75H3.25V15.5" stroke="${INK}" stroke-width="1.7" fill="none" opacity="0.28"/>
    <circle cx="12" cy="12" r="2.6" fill="${INK}"/>
  </g>
  <text x="128" y="98" font-family="Geist, Helvetica, Arial, sans-serif" font-size="27"
    font-weight="500" letter-spacing="-0.5" fill="${INK}">hiart</text>

  <text x="80" y="286" font-family="Georgia, serif" font-size="86" fill="${INK}">Know how your</text>
  <text x="80" y="382" font-family="Georgia, serif" font-size="86" font-style="italic" fill="${INK}">visuals land.</text>

  <line x1="80" y1="438" x2="1120" y2="438" stroke="rgba(17,17,17,0.16)" stroke-width="1"/>

  <text x="80" y="492" font-family="Geist, Helvetica, Arial, sans-serif" font-size="25" fill="#68645F">
    Upload any visual and discover what people notice, feel, trust,
  </text>
  <text x="80" y="530" font-family="Geist, Helvetica, Arial, sans-serif" font-size="25" fill="#68645F">
    misunderstand and remember — before you publish it.
  </text>

  <circle cx="1064" cy="292" r="7" fill="${CORAL}"/>
  <text x="1000" y="530" font-family="Geist, Helvetica, Arial, sans-serif" font-size="19"
    letter-spacing="2" fill="#68645F">hiart.eu</text>
</svg>`
}

async function main() {
  mkdirSync(BRAND, { recursive: true })

  writeFileSync(join(BRAND, 'icon-black.svg'), iconSvg(INK))
  writeFileSync(join(BRAND, 'icon-white.svg'), iconSvg(IVORY))
  writeFileSync(join(BRAND, 'wordmark-black.svg'), wordmarkSvg(INK))
  writeFileSync(join(BRAND, 'wordmark-white.svg'), wordmarkSvg(IVORY))
  writeFileSync(join(BRAND, 'og.svg'), ogSvg())

  const icon = Buffer.from(iconSvg(INK, IVORY, 512))
  await sharp(icon).resize(512, 512).png().toFile(join(PUBLIC, 'icon.png'))
  await sharp(icon).resize(180, 180).png().toFile(join(PUBLIC, 'apple-touch-icon.png'))
  await sharp(icon).resize(32, 32).png().toFile(join(PUBLIC, 'favicon.png'))
  await sharp(Buffer.from(iconSvg(INK, undefined, 512)))
    .resize(512, 512)
    .png()
    .toFile(join(BRAND, 'icon-transparent.png'))
  await sharp(Buffer.from(ogSvg())).png().toFile(join(PUBLIC, 'og.png'))

  // Launch-asset PNGs: everything Orynth needs as a raster file.
  const LAUNCH = join(PUBLIC, 'launch-assets')
  mkdirSync(LAUNCH, { recursive: true })

  await sharp(Buffer.from(iconSvg(IVORY, INK, 1024)))
    .resize(1024, 1024)
    .png()
    .toFile(join(LAUNCH, 'product-icon.png'))
  await sharp(Buffer.from(iconSvg(INK, IVORY, 1024)))
    .resize(1024, 1024)
    .png()
    .toFile(join(LAUNCH, 'product-icon-light.png'))
  await sharp(Buffer.from(iconSvg(INK, undefined, 1024)))
    .resize(1024, 1024)
    .png()
    .toFile(join(LAUNCH, 'logo-icon-transparent.png'))

  const wordmarkPng = async (colour: string, background: string | undefined, file: string) =>
    sharp(Buffer.from(wordmarkSvg(colour, background)))
      .resize({ width: 1320 })
      .png()
      .toFile(join(LAUNCH, file))

  await wordmarkPng(INK, undefined, 'logo-wordmark-dark-transparent.png')
  await wordmarkPng(IVORY, undefined, 'logo-wordmark-light-transparent.png')
  await wordmarkPng(INK, IVORY, 'logo-wordmark-on-ivory.png')
  await wordmarkPng(IVORY, INK, 'logo-wordmark-on-black.png')

  await sharp(Buffer.from(ogSvg())).png().toFile(join(LAUNCH, 'open-graph.png'))

  console.log('Brand assets written to public/ and public/brand/')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
