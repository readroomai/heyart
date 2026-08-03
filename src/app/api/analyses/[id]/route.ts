import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { errorResponse, notFound } from '@/lib/api'
import { getDb, schema } from '@/lib/db'
import { updateAnalysisSchema } from '@/lib/schemas'
import { deleteAnalysis } from '@/lib/analysis-service'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireUser()
    const body = await request.json()
    const patch = updateAnalysisSchema.parse(body)
    const db = getDb()

    // The where clause carries the ownership check, so another user's id
    // simply matches nothing.
    const [row] = await db
      .update(schema.analyses)
      .set({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.isFavourite !== undefined ? { isFavourite: patch.isFavourite } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.analyses.id, id), eq(schema.analyses.userId, user.id)))
      .returning()

    if (!row) notFound('That review does not exist.')
    return NextResponse.json({ analysis: row })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireUser()
    await deleteAnalysis(user.id, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
