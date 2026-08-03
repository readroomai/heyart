import { describe, expect, it } from 'vitest'
import { formatBytes, sniffImageType, validateImageFile } from '@/lib/validation'

const png = { name: 'shot.png', type: 'image/png', size: 1024 }

describe('validateImageFile', () => {
  it('accepts a normal PNG', () => {
    expect(validateImageFile(png).ok).toBe(true)
  })

  it('accepts jpg and jpeg extensions for JPEG', () => {
    expect(validateImageFile({ name: 'a.jpg', type: 'image/jpeg', size: 10 }).ok).toBe(true)
    expect(validateImageFile({ name: 'a.jpeg', type: 'image/jpeg', size: 10 }).ok).toBe(true)
  })

  it('rejects an unsupported extension', () => {
    const result = validateImageFile({ name: 'a.gif', type: 'image/gif', size: 10 })
    expect(result.ok).toBe(false)
  })

  it('rejects a file over 8 MB', () => {
    const result = validateImageFile({ ...png, size: 9 * 1024 * 1024 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toContain('8 MB')
  })

  it('rejects an empty file', () => {
    expect(validateImageFile({ ...png, size: 0 }).ok).toBe(false)
  })

  it('rejects an extension that disagrees with the mime type', () => {
    const result = validateImageFile({ name: 'a.png', type: 'image/jpeg', size: 10 })
    expect(result.ok).toBe(false)
  })

  it('rejects an executable renamed as an image', () => {
    expect(validateImageFile({ name: 'payload.exe', type: 'image/png', size: 10 }).ok).toBe(false)
  })
})

describe('sniffImageType', () => {
  it('detects PNG from its magic number', () => {
    const bytes = new Uint8Array(16)
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(sniffImageType(bytes)).toBe('image/png')
  })

  it('detects JPEG', () => {
    const bytes = new Uint8Array(16)
    bytes.set([0xff, 0xd8, 0xff, 0xe0])
    expect(sniffImageType(bytes)).toBe('image/jpeg')
  })

  it('detects WebP', () => {
    const bytes = new Uint8Array(16)
    const header = [...'RIFF'].map((c) => c.charCodeAt(0))
    const format = [...'WEBP'].map((c) => c.charCodeAt(0))
    bytes.set(header, 0)
    bytes.set(format, 8)
    expect(sniffImageType(bytes)).toBe('image/webp')
  })

  it('returns null for content that is not an image', () => {
    const bytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(sniffImageType(bytes)).toBeNull()
  })

  it('returns null for a truncated buffer', () => {
    expect(sniffImageType(new Uint8Array([0x89, 0x50]))).toBeNull()
  })
})

describe('formatBytes', () => {
  it('formats each magnitude', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})
