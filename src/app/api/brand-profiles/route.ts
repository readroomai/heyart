import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { errorResponse } from '@/lib/api'
import { getDb, schema } from '@/lib/db'
import { brandProfileSchema } from '@/lib/schemas'
import { assertBrandProfileCapacity } from '@/lib/usage'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await requireUser()
    const db = getDb()
    const rows = await db.query.brandProfiles.findMany({
      where: eq(schema.brandProfiles.userId, user.id),
      orderBy: [desc(schema.brandProfiles.isDefault), desc(schema.brandProfiles.createdAt)],
    })
    return NextResponse.json({ brandProfiles: rows })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    await assertBrandProfileCapacity(user.id)
    const input = brandProfileSchema.parse(await request.json())
    const db = getDb()

    if (input.isDefault) {
      await db
        .update(schema.brandProfiles)
        .set({ isDefault: false })
        .where(eq(schema.brandProfiles.userId, user.id))
    }

    const [row] = await db
      .insert(schema.brandProfiles)
      .values({ ...input, userId: user.id })
      .returning()

    return NextResponse.json({ brandProfile: row }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
