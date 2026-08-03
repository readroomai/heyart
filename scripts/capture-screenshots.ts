/**
 * Captures the Orynth launch screenshots from the running application, then
 * frames each one on a branded backdrop so the gallery reads as one set.
 *
 *   npm run screenshots        (starts its own preview server)
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

const PORT = 3210
const BASE = `http://localhost:${PORT}`
const OUT = join(process.cwd(), 'public', 'launch-assets')
const RAW = join(OUT, 'raw')

const IVORY = '#F6F2EA'

type Shot = {
  file: string
  path: string
  caption: string
  prepare?: (page: Page) => Promise<void>
  fullPage?: boolean
  height?: number
}

const SHOTS: Shot[] = [
  {
    file: '01-landing-hero',
    path: '/',
    caption: 'Landing — before they read the caption, they see the creative',
  },
  {
    file: '02-new-review',
    path: '/app/new',
    caption: 'Visual Review — upload the work, set the brief',
  },
  {
    file: '03-visual-review-report',
    path: '/app/history',
    caption: 'The report — score, attention path, prioritised fixes',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Visual Review', exact: true }).click()
      await page.locator('a[href^="/app/analysis/"]').first().click()
      await page.waitForURL(/\/app\/analysis\//)
      await page.waitForTimeout(1800)
      await page.evaluate(() => window.scrollTo(0, 640))
    },
  },
  {
    file: '04-ab-compare',
    path: '/app/history',
    caption: 'A/B Compare — one clear recommendation, and its cost',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'A/B Compare', exact: true }).click()
      await page.locator('a[href^="/app/analysis/"]').first().click()
      await page.waitForURL(/\/app\/analysis\//)
      await page.waitForTimeout(1800)
      await page.evaluate(() => window.scrollTo(0, 330))
    },
  },
  {
    file: '05-feed-audit',
    path: '/app/history',
    caption: 'Feed Audit — a profile read as one body of work',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Feed Audit', exact: true }).click()
      await page.locator('a[href^="/app/analysis/"]').first().click()
      await page.waitForURL(/\/app\/analysis\//)
      await page.waitForTimeout(1800)
      await page.evaluate(() => window.scrollTo(0, 430))
    },
  },
  {
    file: '06-brand-profile',
    path: '/app/brand-profiles',
    caption: 'Brand Profiles — teach it your brand once',
  },
  {
    file: '07-history',
    path: '/app/history',
    caption: 'History — search, filter, favourite, reopen, share',
  },
  {
    file: '08-shared-report',
    path: '/r/exampleshare1',
    caption: 'A shared report — the image stays hidden until revealed',
  },
]

/** Presents a raw capture on a branded backdrop with a caption strip. */
async function frame(rawFile: string, outFile: string, caption: string) {
  const image = sharp(rawFile)
  const meta = await image.metadata()
  const width = meta.width ?? 2880
  const height = meta.height ?? 1800

  const pad = Math.round(width * 0.045)
  const captionBand = Math.round(width * 0.052)
  const canvasWidth = width + pad * 2
  const canvasHeight = height + pad * 2 + captionBand

  const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
    <rect width="${canvasWidth}" height="${canvasHeight}" fill="${IVORY}"/>
    <g transform="translate(${pad} ${pad + height + Math.round(captionBand * 0.42)})">
      <g transform="scale(${width / 1000})">
        <path d="M3.25 8.5V3.25H8.5" stroke="#111111" stroke-width="1.7" fill="none"/>
        <path d="M20.75 15.5V20.75H15.5" stroke="#111111" stroke-width="1.7" fill="none"/>
        <path d="M15.5 3.25h5.25V8.5" stroke="#111111" stroke-width="1.7" fill="none" opacity="0.28"/>
        <path d="M8.5 20.75H3.25V15.5" stroke="#111111" stroke-width="1.7" fill="none" opacity="0.28"/>
        <circle cx="12" cy="12" r="2.6" fill="#111111"/>
      </g>
      <text x="${Math.round(width * 0.036)}" y="${Math.round(width * 0.019)}"
        font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(width * 0.0155)}"
        fill="#68645F">${caption.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
    </g>
  </svg>`

  await sharp(Buffer.from(label))
    .composite([{ input: await image.toBuffer(), top: pad, left: pad }])
    .png()
    .toFile(outFile)
}

async function main() {
  rmSync(join(process.cwd(), '.data'), { recursive: true, force: true })
  execFileSync('npx', ['tsx', 'scripts/seed-preview.ts'], { stdio: 'inherit' })

  mkdirSync(RAW, { recursive: true })

  const server = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HIART_PREVIEW_AUTH: '1',
      // Share URLs in the screenshots should read as the real domain.
      NEXT_PUBLIC_APP_URL: 'https://hiart.eu',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '',
      CLERK_SECRET_KEY: '',
    },
    stdio: 'ignore',
    detached: true,
  })

  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()

    // Wait for the server to answer.
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        await page.goto(BASE, { timeout: 3000 })
        break
      } catch {
        await page.waitForTimeout(1000)
      }
    }

    // The Next.js dev indicator is not part of the product.
    await context.addInitScript(() => {
      const style = document.createElement('style')
      style.textContent =
        'nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important}'
      document.documentElement.appendChild(style)
    })

    for (const shot of SHOTS) {
      await page.goto(`${BASE}${shot.path}`)
      await page.waitForTimeout(1500)
      if (shot.prepare) await shot.prepare(page)
      await page.waitForTimeout(900)

      const rawFile = join(RAW, `${shot.file}.png`)
      await page.screenshot({ path: rawFile, fullPage: false })
      await frame(rawFile, join(OUT, `${shot.file}.png`), shot.caption)
      console.log(`captured ${shot.file}`)
    }

    // A phone-sized capture, since the mobile layout is its own design.
    const phone = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    })
    await phone.addInitScript(() => {
      const style = document.createElement('style')
      style.textContent = 'nextjs-portal,[data-nextjs-toast]{display:none !important}'
      document.documentElement.appendChild(style)
    })
    const phonePage = await phone.newPage()
    await phonePage.goto(`${BASE}/`)
    await phonePage.waitForTimeout(1800)
    const mobileRaw = join(RAW, '09-mobile.png')
    await phonePage.screenshot({ path: mobileRaw })
    await frame(mobileRaw, join(OUT, '09-mobile.png'), 'Mobile — designed, not compressed')
    console.log('captured 09-mobile')
  } finally {
    await browser.close()
    if (server.pid) process.kill(-server.pid, 'SIGTERM')
  }

  console.log(`\nLaunch screenshots written to ${OUT}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
