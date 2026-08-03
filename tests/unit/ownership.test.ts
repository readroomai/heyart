import { describe, expect, it } from 'vitest'
import { ownsRecord } from '@/lib/auth'
import { buildStoragePath } from '@/lib/storage'
import { extractJson, safeParseJson, AiResponseError } from '@/lib/ai'

describe('ownsRecord', () => {
  it('accepts a record belonging to the user', () => {
    expect(ownsRecord({ userId: 'user-1' }, 'user-1')).toBe(true)
  })

  it('rejects another user’s record', () => {
    expect(ownsRecord({ userId: 'user-2' }, 'user-1')).toBe(false)
  })

  it('rejects a missing record rather than throwing', () => {
    expect(ownsRecord(null, 'user-1')).toBe(false)
    expect(ownsRecord(undefined, 'user-1')).toBe(false)
  })
})

describe('buildStoragePath', () => {
  it('namespaces every upload under the user id', () => {
    expect(buildStoragePath('user-1', 'photo.png').startsWith('user-1/')).toBe(true)
  })

  it('keeps the original extension', () => {
    expect(buildStoragePath('user-1', 'photo.webp').endsWith('.webp')).toBe(true)
  })

  it('strips path traversal attempts out of the extension', () => {
    const path = buildStoragePath('user-1', 'evil.../../../etc/passwd')
    expect(path).not.toContain('..')
    expect(path.startsWith('user-1/')).toBe(true)
  })

  it('does not reuse a filename', () => {
    const a = buildStoragePath('user-1', 'photo.png')
    const b = buildStoragePath('user-1', 'photo.png')
    expect(a).not.toBe(b)
  })
})

describe('model response parsing', () => {
  it('reads a plain JSON object', () => {
    expect(safeParseJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('unwraps a fenced JSON block', () => {
    expect(safeParseJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('ignores prose around the object', () => {
    expect(safeParseJson('Here you go:\n{"a":1}\nHope that helps.')).toEqual({ a: 1 })
  })

  it('throws a typed error when there is no object', () => {
    expect(() => extractJson('no json at all')).toThrow(AiResponseError)
  })

  it('throws a typed error on malformed JSON', () => {
    expect(() => safeParseJson('{"a":}')).toThrow(AiResponseError)
  })
})
