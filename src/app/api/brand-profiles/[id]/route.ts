import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { errorResponse, notFound } from '@/lib/api'
import { getDb, schema } from '@/lib/db'
import { brandProfileSchema } from '@/lib/schemas'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireUser()
    const input = brandProfileSchema.partial().parse(await request.json())
    const db = getDb()

    // Only one default per user.
    if (input.isDefault) {
      await db
        .update(schema.brandProfiles)
        .set({ isDefault: false })
        .where(eq(schema.brandProfiles.userId, user.id))
    }

    const [row] = await db
      .update(schema.brandProfiles)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(schema.brandProfiles.id, id), eq(schema.brandProfiles.userId, user.id)))
      .returning()

    if (!row) notFound('That Brand Profile does not exist.')
    return NextResponse.json({ brandProfile: row })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireUser()
    const db = getDb()
    const [row] = await db
      .delete(schema.brandProfiles)
      .where(and(eq(schema.brandProfiles.id, id), eq(schema.brandProfiles.userId, user.id)))
      .returning()

    if (!row) notFound('That Brand Profile does not exist.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
