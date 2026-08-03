import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { errorResponse } from '@/lib/api'
import { buildStoragePath, uploadImage } from '@/lib/storage'
import { sniffImageType, validateImageFile } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Accepts one image, validates it, and stores it in the private bucket under
 * a path derived from the server-resolved user id.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image was included in the upload.', code: 'no_file' },
        { status: 400 }
      )
    }

    const check = validateImageFile({ name: file.name, type: file.type, size: file.size })
    if (!check.ok) {
      return NextResponse.json({ error: check.reason, code: 'invalid_file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const sniffed = sniffImageType(new Uint8Array(buffer.subarray(0, 16)))
    if (!sniffed || sniffed !== file.type) {
      return NextResponse.json(
        { error: 'That file is not a valid PNG, JPEG or WebP image.', code: 'invalid_file' },
        { status: 400 }
      )
    }

    const storagePath = buildStoragePath(user.id, file.name)
    await uploadImage({ path: storagePath, body: buffer, mimeType: sniffed })

    return NextResponse.json({
      storagePath,
      originalName: file.name.slice(0, 255),
      mimeType: sniffed,
      byteSize: file.size,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
