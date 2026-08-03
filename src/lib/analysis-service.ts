import 'server-only'
import { and, eq } from 'drizzle-orm'
import { getDb, schema } from './db'
import { generateReport, type ImagePart } from './ai'
import { buildPrompt } from './prompts'
import { downloadImage, deleteImages } from './storage'
import { schemaForMode } from './schemas'
import type { CreateAnalysisInput } from './schemas'
import { assertWithinDailyLimit, recordUsageEvent } from './usage'
import { GEMINI_MODEL } from './env'
import type { AnalysisRow } from './db/schema'

/**
 * Runs one analysis end to end: limit check, image fetch, model call, schema
 * validation, then persistence. A row is only marked complete once the
 * response has passed validation.
 */
export async function runAnalysis(
  userId: string,
  input: CreateAnalysisInput
): Promise<AnalysisRow> {
  const db = getDb()
  await assertWithinDailyLimit(userId)

  // Attaching another user's Brand Profile is not possible: the lookup is
  // scoped to the caller.
  let brandProfile = null
  if (input.brandProfileId) {
    brandProfile =
      (await db.query.brandProfiles.findFirst({
        where: and(
          eq(schema.brandProfiles.id, input.brandProfileId),
          eq(schema.brandProfiles.userId, userId)
        ),
      })) ?? null
  }

  const images: ImagePart[] = []
  for (const image of input.images) {
    if (!image.storagePath.startsWith(`${userId}/`)) {
      const error = new Error('That image does not belong to your account.')
      error.name = 'ForbiddenError'
      throw error
    }
    const { base64, mimeType } = await downloadImage(image.storagePath)
    images.push({ base64, mimeType })
  }

  const prompt = buildPrompt({
    mode: input.mode,
    visualType: input.visualType,
    platform: input.platform,
    targetAudience: input.targetAudience,
    goal: input.goal,
    desiredImpression: input.desiredImpression,
    context: input.context,
    brandProfile,
    customAudience: input.customAudience ?? null,
  })

  const { data, model } = await generateReport({
    prompt,
    images,
    schema: schemaForMode(input.mode),
    model: GEMINI_MODEL,
    mode: input.mode,
  })

  const [row] = await db
    .insert(schema.analyses)
    .values({
      userId,
      mode: input.mode,
      title: data.title,
      visualType: input.visualType,
      platform: input.platform,
      targetAudience: input.targetAudience,
      goal: input.goal,
      desiredImpression: input.desiredImpression,
      context: input.context ?? '',
      brandProfileId: brandProfile?.id ?? null,
      result: data,
      model,
      confidence: data.confidence,
      status: 'complete',
    })
    .returning()

  if (!row) throw new Error('The review could not be saved.')

  await db.insert(schema.analysisImages).values(
    input.images.map((image) => ({
      analysisId: row.id,
      userId,
      storagePath: image.storagePath,
      originalName: image.originalName,
      mimeType: image.mimeType,
      byteSize: image.byteSize,
      imageRole: image.role,
    }))
  )

  await recordUsageEvent(userId, `analysis:${input.mode}`, model)

  return row
}

/** Deletes an analysis and everything attached to it, including the files. */
export async function deleteAnalysis(userId: string, analysisId: string): Promise<void> {
  const db = getDb()
  const analysis = await db.query.analyses.findFirst({
    where: and(eq(schema.analyses.id, analysisId), eq(schema.analyses.userId, userId)),
  })
  if (!analysis) {
    const error = new Error('That review does not exist.')
    error.name = 'NotFoundError'
    throw error
  }

  const images = await db.query.analysisImages.findMany({
    where: eq(schema.analysisImages.analysisId, analysisId),
  })

  // Storage first: a failure here must not leave orphaned files behind a
  // deleted row. Rows cascade from the analysis delete below.
  await deleteImages(images.map((image) => image.storagePath)).catch((error) => {
    console.error(`[hiart] storage cleanup failed: ${(error as Error).message}`)
  })

  await db.delete(schema.analyses).where(eq(schema.analyses.id, analysisId))
}
