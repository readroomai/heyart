/**
 * Seeds the local preview database with one user, a Brand Profile and one
 * saved analysis per mode, using the bundled sample reports.
 *
 * Local preview only — it writes to .data/, never to Supabase.
 *
 *   HIART_PREVIEW_AUTH=1 npx tsx scripts/seed-preview.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import sharp from 'sharp'
import {
  SAMPLE_COMPARE_REPORT,
  SAMPLE_FEED_AUDIT,
  SAMPLE_VISUAL_REPORT,
} from '../src/lib/sample-data'
import { toPreviewSql } from '../src/lib/db/preview-schema'

const ROOT = process.cwd()
const DATA = join(ROOT, '.data')

/* ---------------- sample creatives, drawn not photographed --------------- */

function coffeeSvg(variant: 'a' | 'b') {
  const isB = variant === 'b'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <rect width="1080" height="1350" fill="${isB ? '#EDE6DA' : '#E9E2D6'}"/>
  <ellipse cx="${isB ? 540 : 840}" cy="${isB ? 120 : 350}" rx="620" ry="480" fill="#FFFFFF" opacity="0.55"/>
  ${
    isB
      ? `<text x="540" y="190" text-anchor="middle" font-family="Courier New, monospace" font-size="26" letter-spacing="7" fill="#8A5A3B">NEW SINGLE ORIGIN</text>
         <text x="540" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="86" fill="#3A2B20">Northbound</text>
         <text x="540" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="86" font-style="italic" fill="#3A2B20">Coffee Roasters</text>`
      : `<text x="150" y="290" font-family="Georgia, serif" font-size="82" fill="#3A2B20">Northbound</text>
         <text x="150" y="378" font-family="Georgia, serif" font-size="82" font-style="italic" fill="#3A2B20">Coffee Roasters</text>
         <text x="150" y="452" font-family="Helvetica, Arial, sans-serif" font-size="27" fill="#6B5646">Small batch, slow roasted, north coast water.</text>`
  }
  <g transform="translate(${isB ? 415 : 690} ${isB ? 620 : 560})">
    <path d="M40 0 H210 L250 640 H0 Z" fill="#7A5334"/>
    <path d="M40 0 H125 L125 640 H0 Z" fill="#8A6244" opacity="0.6"/>
    <line x1="60" y1="130" x2="190" y2="130" stroke="#F1E7D8" stroke-width="2" opacity="0.5"/>
    <text x="125" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#F1E7D8">NB</text>
    <text x="125" y="285" text-anchor="middle" font-family="Courier New, monospace" font-size="19" letter-spacing="5" fill="#F1E7D8" opacity="0.72">ROAST 04</text>
  </g>
  <text x="${isB ? 540 : 150}" y="1290" ${isB ? 'text-anchor="middle"' : ''} font-family="Courier New, monospace" font-size="21" letter-spacing="5" fill="#6B5646" opacity="0.5">ETHIOPIA   WASHED   250G</text>
</svg>`
}

function feedSvg() {
  const tiles = [
    ['#E9E2D6', 'flat'],
    ['#2C2722', 'editorial'],
    ['#F0E4E4', 'pastel'],
    ['#E9E2D6', 'flat'],
    ['#E9E2D6', 'flat'],
    ['#DDE7F8', 'pastel'],
    ['#2C2722', 'editorial'],
    ['#EDE6DA', 'flat'],
    ['#F0E4E4', 'pastel'],
  ] as const

  const grid = tiles
    .map(([bg, kind], index) => {
      const x = 60 + (index % 3) * 320
      const y = 300 + Math.floor(index / 3) * 320
      const inner =
        kind === 'flat'
          ? `<path d="M${x + 125} ${y + 110} H${x + 175} L${x + 190} ${y + 260} H${x + 110} Z" fill="#8A6244"/>`
          : kind === 'editorial'
            ? `<rect x="${x + 40}" y="${y + 210}" width="190" height="7" fill="#F1E7D8"/><rect x="${x + 40}" y="${y + 232}" width="120" height="7" fill="#F1E7D8" opacity="0.6"/>`
            : `<circle cx="${x + 150}" cy="${y + 150}" r="66" fill="#C39A9A" opacity="0.75"/>`
      return `<rect x="${x}" y="${y}" width="300" height="300" fill="${bg}"/>${inner}`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1300" width="1080" height="1300">
  <rect width="1080" height="1300" fill="#FFFFFF"/>
  <circle cx="140" cy="140" r="72" fill="#DDD3C4"/>
  <rect x="250" y="98" width="300" height="18" rx="9" fill="#3A2B20"/>
  <rect x="250" y="134" width="470" height="13" rx="7" fill="#DDD3C4"/>
  <rect x="250" y="164" width="220" height="13" rx="7" fill="#EAE3D8"/>
  ${grid}
</svg>`
}

/* ------------------------------- seeding -------------------------------- */

const PREVIEW_CLERK_ID = 'preview_local_user'

async function main() {
  mkdirSync(DATA, { recursive: true })
  const client = new PGlite(join(DATA, 'preview-db'))

  const migration = toPreviewSql(readFileSync(join(ROOT, 'drizzle', '0000_init.sql'), 'utf8'))
  await client.exec(migration)

  // Reset previous preview data so the seed is repeatable.
  await client.exec(`delete from users where clerk_user_id = '${PREVIEW_CLERK_ID}';`)

  const userResult = await client.query<{ id: string }>(
    `insert into users (clerk_user_id, display_name, email, onboarding_completed)
     values ($1, $2, $3, true) returning id`,
    [PREVIEW_CLERK_ID, 'Gia Macool', 'studio@hiart.eu']
  )
  const userId = userResult.rows[0]!.id

  const profileResult = await client.query<{ id: string }>(
    `insert into brand_profiles
      (user_id, name, description, target_audience, personality, desired_impression,
       primary_platform, primary_colours, secondary_colours, positive_words, negative_words, is_default)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true) returning id`,
    [
      userId,
      'Northbound Coffee',
      'A small-batch roaster selling direct to speciality drinkers.',
      'Speciality coffee buyers, 25–45',
      'Warm, considered, unhurried',
      'Premium',
      'Instagram',
      JSON.stringify(['#3A2B20', '#8A6244']),
      JSON.stringify(['#E9E2D6', '#F26445']),
      JSON.stringify(['Crafted', 'Honest', 'Premium']),
      JSON.stringify(['Corporate', 'Shouty', 'Cheap']),
    ]
  )
  const profileId = profileResult.rows[0]!.id

  async function writeImage(name: string, svg: string) {
    const storagePath = `${userId}/${name}.png`
    const target = join(DATA, 'uploads', storagePath)
    mkdirSync(dirname(target), { recursive: true })
    const png = await sharp(Buffer.from(svg)).png().toBuffer()
    writeFileSync(target, png)
    return { storagePath, byteSize: png.length }
  }

  const variantA = await writeImage('sample-variant-a', coffeeSvg('a'))
  const variantB = await writeImage('sample-variant-b', coffeeSvg('b'))
  const feed = await writeImage('sample-feed', feedSvg())

  async function addAnalysis(
    mode: string,
    title: string,
    result: unknown,
    confidence: number,
    images: { storagePath: string; byteSize: number; role: string; name: string }[],
    overrides: Partial<{
      platform: string
      goal: string
      impression: string
      visualType: string
    }> = {}
  ) {
    const analysis = await client.query<{ id: string }>(
      `insert into analyses
        (user_id, mode, title, visual_type, platform, target_audience, goal, desired_impression,
         context, brand_profile_id, result, model, confidence, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'complete') returning id`,
      [
        userId,
        mode,
        title,
        overrides.visualType ?? 'Instagram post',
        overrides.platform ?? 'Instagram',
        'Potential customers',
        overrides.goal ?? 'Launch a product',
        overrides.impression ?? 'Premium',
        '',
        profileId,
        JSON.stringify(result),
        'gemini-3-flash-preview',
        confidence,
      ]
    )
    const analysisId = analysis.rows[0]!.id
    for (const image of images) {
      await client.query(
        `insert into analysis_images
          (analysis_id, user_id, storage_path, original_name, mime_type, byte_size, image_role)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [analysisId, userId, image.storagePath, image.name, 'image/png', image.byteSize, image.role]
      )
    }
    await client.query(`insert into usage_events (user_id, event_type, model) values ($1,$2,$3)`, [
      userId,
      `analysis:${mode}`,
      'gemini-3-flash-preview',
    ])
    return analysisId
  }

  const visualId = await addAnalysis(
    'visual_review',
    SAMPLE_VISUAL_REPORT.title,
    SAMPLE_VISUAL_REPORT,
    SAMPLE_VISUAL_REPORT.confidence,
    [{ ...variantA, role: 'primary', name: 'northbound-launch.png' }]
  )

  await addAnalysis(
    'ab_compare',
    SAMPLE_COMPARE_REPORT.title,
    SAMPLE_COMPARE_REPORT,
    SAMPLE_COMPARE_REPORT.confidence,
    [
      { ...variantA, role: 'variant_a', name: 'variant-a.png' },
      { ...variantB, role: 'variant_b', name: 'variant-b.png' },
    ],
    { goal: 'Communicate clearly' }
  )

  await addAnalysis(
    'feed_audit',
    SAMPLE_FEED_AUDIT.title,
    SAMPLE_FEED_AUDIT,
    SAMPLE_FEED_AUDIT.confidence,
    [{ ...feed, role: 'feed', name: 'profile-screenshot.png' }],
    { visualType: 'Profile screenshot', goal: 'Build authority' }
  )

  // Backdate the two older reviews so the daily allowance is not already
  // spent the first time the seeded workspace is opened.
  await client.query(
    `update analyses set created_at = now() - interval '2 days' where user_id = $1 and mode <> 'visual_review'`,
    [userId]
  )

  // A share link so the public report route can be exercised.
  await client.query(
    `insert into share_links (user_id, analysis_id, slug, reveal_images, is_active)
     values ($1,$2,'exampleshare1',true,true)`,
    [userId, visualId]
  )

  await client.close()
  console.log('Preview data seeded. Start with: HIART_PREVIEW_AUTH=1 npm run dev')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
