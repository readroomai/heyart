import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES } from './options'

export type FileCheck = { ok: true } | { ok: false; reason: string }

type FileLike = { name: string; type: string; size: number }

/**
 * Extension, MIME type and size are checked together: a renamed .exe and an
 * 11 MB screenshot both need to fail before anything reaches storage.
 */
export function validateImageFile(file: FileLike): FileCheck {
  const extension = (file.name.split('.').pop() || '').toLowerCase()
  if (!extension || !(ACCEPTED_EXTENSIONS as readonly string[]).includes(extension)) {
    return { ok: false, reason: 'Use a PNG, JPEG or WebP image.' }
  }
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, reason: 'That file type is not supported. Use PNG, JPEG or WebP.' }
  }
  if (file.size <= 0) {
    return { ok: false, reason: 'That file appears to be empty.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: `Images must be 8 MB or smaller. That one is ${formatBytes(file.size)}.`,
    }
  }
  const extensionMatchesType =
    (file.type === 'image/png' && extension === 'png') ||
    (file.type === 'image/jpeg' && (extension === 'jpg' || extension === 'jpeg')) ||
    (file.type === 'image/webp' && extension === 'webp')
  if (!extensionMatchesType) {
    return { ok: false, reason: 'The file extension does not match its contents.' }
  }
  return { ok: true }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Magic-number check on the decoded bytes. Cheap, and it catches a mislabelled
 * MIME type that passed the checks above.
 */
export function sniffImageType(
  bytes: Uint8Array
): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  const riff = String.fromCharCode(...Array.from(bytes.slice(0, 4)))
  const webp = String.fromCharCode(...Array.from(bytes.slice(8, 12)))
  if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp'
  return null
}
