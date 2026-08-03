import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverEnv, isPreviewAuthEnabled, isStorageConfigured } from './env'
import { ConfigurationError } from './db'

export const UPLOAD_BUCKET = 'hiart-uploads'

let cached: SupabaseClient | null = null

/** Service-role client. Server only — this key is never sent to the browser. */
function getStorageClient(): SupabaseClient {
  if (cached) return cached
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnv
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new ConfigurationError(
      'Supabase storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }
  cached = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/** True when uploads are written to the local .data directory instead. */
function shouldUsePreviewStorage(): boolean {
  return !isStorageConfigured() && isPreviewAuthEnabled()
}

function previewPath(path: string): string {
  const { join } = require('node:path') as typeof import('node:path')
  return join(process.cwd(), '.data', 'uploads', path)
}

/** Storage paths are always derived from the server-resolved user id. */
export function buildStoragePath(userId: string, originalName: string): string {
  const extension = (originalName.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
  const unique = globalThis.crypto.randomUUID()
  return `${userId}/${unique}.${extension || 'png'}`
}

export async function uploadImage(params: {
  path: string
  body: ArrayBuffer | Buffer
  mimeType: string
}): Promise<void> {
  if (shouldUsePreviewStorage()) {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname } = await import('node:path')
    const target = previewPath(params.path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(params.body as ArrayBuffer))
    return
  }

  const client = getStorageClient()
  const { error } = await client.storage.from(UPLOAD_BUCKET).upload(params.path, params.body, {
    contentType: params.mimeType,
    upsert: false,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
}

export async function downloadImage(path: string): Promise<{ base64: string; mimeType: string }> {
  if (shouldUsePreviewStorage()) {
    const { readFile } = await import('node:fs/promises')
    const buffer = await readFile(previewPath(path))
    const extension = path.split('.').pop()?.toLowerCase()
    const mimeType =
      extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : extension === 'webp'
          ? 'image/webp'
          : 'image/png'
    return { base64: buffer.toString('base64'), mimeType }
  }

  const client = getStorageClient()
  const { data, error } = await client.storage.from(UPLOAD_BUCKET).download(path)
  if (error || !data) throw new Error(`Could not read the stored image: ${error?.message ?? path}`)
  const buffer = Buffer.from(await data.arrayBuffer())
  return { base64: buffer.toString('base64'), mimeType: data.type || 'image/png' }
}

/** Short-lived signed URL. Nothing in the bucket is publicly readable. */
export async function createSignedUrl(path: string, expiresInSeconds = 60 * 30): Promise<string> {
  if (shouldUsePreviewStorage()) {
    // Served by an authenticated, ownership-checked route in preview mode.
    return `/api/preview-image?path=${encodeURIComponent(path)}`
  }

  const client = getStorageClient()
  const { data, error } = await client.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error || !data) throw new Error(`Could not sign the image URL: ${error?.message ?? path}`)
  return data.signedUrl
}

export async function deleteImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return

  if (shouldUsePreviewStorage()) {
    const { rm } = await import('node:fs/promises')
    await Promise.all(paths.map((path) => rm(previewPath(path), { force: true })))
    return
  }

  const client = getStorageClient()
  const { error } = await client.storage.from(UPLOAD_BUCKET).remove(paths)
  if (error) throw new Error(`Could not delete stored images: ${error.message}`)
}
