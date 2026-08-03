import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { errorResponse, forbidden } from '@/lib/api'
import { isPreviewAuthEnabled, isStorageConfigured } from '@/lib/env'

export const runtime = 'nodejs'

/**
 * Serves an image from local preview storage. Only exists when Supabase
 * storage is absent and preview mode is explicitly enabled, and it still
 * enforces that the path belongs to the signed-in user.
 */
export async function GET(request: Request) {
  try {
    if (isStorageConfigured() || !isPreviewAuthEnabled()) {
      return NextResponse.json({ error: 'Not available.', code: 'not_found' }, { status: 404 })
    }

    const user = await requireUser()
    const path = new URL(request.url).searchParams.get('path')
    if (!path) {
      return NextResponse.json({ error: 'Missing path.', code: 'bad_request' }, { status: 400 })
    }
    if (path.includes('..') || !path.startsWith(`${user.id}/`)) forbidden()

    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const buffer = await readFile(join(process.cwd(), '.data', 'uploads', path))
    const extension = path.split('.').pop()?.toLowerCase()
    const contentType =
      extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : extension === 'webp'
          ? 'image/webp'
          : 'image/png'

    return new NextResponse(new Uint8Array(buffer), {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'private, max-age=600' },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
