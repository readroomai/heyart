import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { errorResponse } from '@/lib/api'
import { getDb, schema } from '@/lib/db'
import { createAnalysisSchema } from '@/lib/schemas'
import { runAnalysis } from '@/lib/analysis-service'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function GET() {
  try {
    const user = await requireUser()
    const db = getDb()
    const rows = await db.query.analyses.findMany({
      where: eq(schema.analyses.userId, user.id),
      orderBy: [desc(schema.analyses.createdAt)],
      limit: 100,
    })
    return NextResponse.json({ analyses: rows })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const input = createAnalysisSchema.parse(body)
    const analysis = await runAnalysis(user.id, input)
    return NextResponse.json({ analysis }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
