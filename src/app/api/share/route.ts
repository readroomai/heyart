import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { errorResponse, notFound } from '@/lib/api'
import { getDb, schema } from '@/lib/db'
import { shareLinkSchema } from '@/lib/schemas'
import { generateSlug } from '@/lib/share'
import { APP_URL } from '@/lib/env'

export const runtime = 'nodejs'

/** Creates, or reactivates, the public link for one analysis. */
export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const input = shareLinkSchema.parse(await request.json())
    const db = getDb()

    const analysis = await db.query.analyses.findFirst({
      where: and(eq(schema.analyses.id, input.analysisId), eq(schema.analyses.userId, user.id)),
    })
    if (!analysis) notFound('That review does not exist.')

    const existing = await db.query.shareLinks.findFirst({
      where: eq(schema.shareLinks.analysisId, input.analysisId),
    })

    const link = existing
      ? (
          await db
            .update(schema.shareLinks)
            .set({ isActive: true, revealImages: input.revealImages })
            .where(eq(schema.shareLinks.id, existing.id))
            .returning()
        )[0]
      : (
          await db
            .insert(schema.shareLinks)
            .values({
              userId: user.id,
              analysisId: input.analysisId,
              slug: generateSlug(),
              revealImages: input.revealImages,
            })
            .returning()
        )[0]

    if (!link) throw new Error('The share link could not be created.')

    return NextResponse.json({ shareLink: link, url: `${APP_URL}/r/${link.slug}` })
  } catch (error) {
    return errorResponse(error)
  }
}

/** Revokes the link. The slug stops resolving immediately. */
export async function DELETE(request: Request) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    if (!analysisId) {
      return NextResponse.json(
        { error: 'Missing analysisId.', code: 'bad_request' },
        { status: 400 }
      )
    }

    const db = getDb()
    const [row] = await db
      .update(schema.shareLinks)
      .set({ isActive: false })
      .where(
        and(eq(schema.shareLinks.analysisId, analysisId), eq(schema.shareLinks.userId, user.id))
      )
      .returning()

    if (!row) notFound('There is no share link for that review.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
