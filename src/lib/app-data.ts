import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { getDb, schema } from './db'
import { requireUser } from './auth'
import { getDailyUsage } from './usage'
import { createSignedUrl } from './storage'
import type { AnalysisRow, BrandProfileRow } from './db/schema'

/** Everything the app shell and forms need for the current user. */
export async function loadWorkspace() {
  const user = await requireUser()
  const db = getDb()
  const [brandProfiles, usage] = await Promise.all([
    db.query.brandProfiles.findMany({
      where: eq(schema.brandProfiles.userId, user.id),
      orderBy: [desc(schema.brandProfiles.isDefault), desc(schema.brandProfiles.createdAt)],
    }),
    getDailyUsage(user.id),
  ])
  return { user, brandProfiles, usage }
}

export async function loadRecentAnalyses(userId: string, limit = 6): Promise<AnalysisRow[]> {
  const db = getDb()
  return db.query.analyses.findMany({
    where: eq(schema.analyses.userId, userId),
    orderBy: [desc(schema.analyses.createdAt)],
    limit,
  })
}

export async function loadAllAnalyses(userId: string): Promise<AnalysisRow[]> {
  const db = getDb()
  return db.query.analyses.findMany({
    where: eq(schema.analyses.userId, userId),
    orderBy: [desc(schema.analyses.createdAt)],
    limit: 200,
  })
}

export async function loadBrandProfiles(userId: string): Promise<BrandProfileRow[]> {
  const db = getDb()
  return db.query.brandProfiles.findMany({
    where: eq(schema.brandProfiles.userId, userId),
    orderBy: [desc(schema.brandProfiles.isDefault), desc(schema.brandProfiles.createdAt)],
  })
}

/** One analysis with signed image URLs and its share link, ownership enforced. */
export async function loadAnalysisDetail(userId: string, analysisId: string) {
  const db = getDb()
  const analysis = await db.query.analyses.findFirst({
    where: and(eq(schema.analyses.id, analysisId), eq(schema.analyses.userId, userId)),
  })
  if (!analysis) return null

  const [images, shareLink] = await Promise.all([
    db.query.analysisImages.findMany({
      where: eq(schema.analysisImages.analysisId, analysisId),
    }),
    db.query.shareLinks.findFirst({
      where: eq(schema.shareLinks.analysisId, analysisId),
    }),
  ])

  const ordered = [...images].sort((a, b) => a.imageRole.localeCompare(b.imageRole))
  const previews = await Promise.all(
    ordered.map(async (image) => ({
      url: await createSignedUrl(image.storagePath).catch(() => ''),
      label: image.originalName,
    }))
  )

  return { analysis, images: ordered, previews: previews.filter((p) => p.url), shareLink }
}
