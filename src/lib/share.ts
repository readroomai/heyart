import type { AnalysisRow, ShareLinkRow } from './db/schema'

// No l, o, 0 or 1 — a slug is read aloud and typed by hand often enough.
const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

/** URL-safe slug with no ambiguous characters. Not guessable in practice. */
export function generateSlug(length = 12): string {
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length]).join('')
}

export type PublicShare = {
  slug: string
  title: string
  mode: string
  createdAt: string
  revealImages: boolean
  result: unknown
  platform: string
  goal: string
  desiredImpression: string
}

/**
 * Everything a public visitor is allowed to see. Deliberately built by
 * allow-list: private context, storage paths, user ids, emails, brand profile
 * ids and internal prompts are never included.
 */
export function toPublicShare(analysis: AnalysisRow, link: ShareLinkRow): PublicShare {
  return {
    slug: link.slug,
    title: analysis.title,
    mode: analysis.mode,
    createdAt: analysis.createdAt.toISOString(),
    revealImages: link.revealImages,
    result: analysis.result,
    platform: analysis.platform,
    goal: analysis.goal,
    desiredImpression: analysis.desiredImpression,
  }
}

export function isShareLinkUsable(link: ShareLinkRow, now: Date = new Date()): boolean {
  if (!link.isActive) return false
  if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) return false
  return true
}
