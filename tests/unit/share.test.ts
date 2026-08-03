import { describe, expect, it } from 'vitest'
import { generateSlug, isShareLinkUsable, toPublicShare } from '@/lib/share'
import type { AnalysisRow, ShareLinkRow } from '@/lib/db/schema'
import { SAMPLE_VISUAL_REPORT } from '@/lib/sample-data'

const analysis: AnalysisRow = {
  id: 'analysis-1',
  userId: 'user-1',
  mode: 'visual_review',
  title: 'Launch announcement',
  visualType: 'Instagram post',
  platform: 'Instagram',
  targetAudience: 'Potential customers',
  goal: 'Launch a product',
  desiredImpression: 'Premium',
  context: 'Internal note: the CEO hates the old bag.',
  brandProfileId: 'brand-1',
  result: SAMPLE_VISUAL_REPORT,
  model: 'gemini-3-flash-preview',
  confidence: 0.74,
  isFavourite: false,
  status: 'complete',
  createdAt: new Date('2026-08-04T10:00:00Z'),
  updatedAt: new Date('2026-08-04T10:00:00Z'),
}

const link: ShareLinkRow = {
  id: 'link-1',
  userId: 'user-1',
  analysisId: 'analysis-1',
  slug: 'abc123def456',
  revealImages: false,
  isActive: true,
  createdAt: new Date('2026-08-04T10:00:00Z'),
  expiresAt: null,
}

describe('toPublicShare', () => {
  const shared = toPublicShare(analysis, link)

  it('never exposes the owner', () => {
    expect(JSON.stringify(shared)).not.toContain('user-1')
    expect(shared).not.toHaveProperty('userId')
  })

  it('never exposes the private context the user typed', () => {
    expect(JSON.stringify(shared)).not.toContain('CEO hates')
    expect(shared).not.toHaveProperty('context')
  })

  it('never exposes the brand profile id or internal ids', () => {
    expect(shared).not.toHaveProperty('brandProfileId')
    expect(shared).not.toHaveProperty('id')
  })

  it('carries the report and the public brief only', () => {
    expect(shared.title).toBe('Launch announcement')
    expect(shared.platform).toBe('Instagram')
    expect(shared.result).toEqual(SAMPLE_VISUAL_REPORT)
  })

  it('defaults to hiding the image', () => {
    expect(shared.revealImages).toBe(false)
  })
})

describe('isShareLinkUsable', () => {
  it('accepts an active link with no expiry', () => {
    expect(isShareLinkUsable(link)).toBe(true)
  })

  it('rejects a revoked link', () => {
    expect(isShareLinkUsable({ ...link, isActive: false })).toBe(false)
  })

  it('rejects an expired link', () => {
    const expired = { ...link, expiresAt: new Date('2026-08-01T00:00:00Z') }
    expect(isShareLinkUsable(expired, new Date('2026-08-04T00:00:00Z'))).toBe(false)
  })

  it('accepts a link that has not expired yet', () => {
    const future = { ...link, expiresAt: new Date('2026-09-01T00:00:00Z') }
    expect(isShareLinkUsable(future, new Date('2026-08-04T00:00:00Z'))).toBe(true)
  })
})

describe('generateSlug', () => {
  it('produces the requested length', () => {
    expect(generateSlug(12)).toHaveLength(12)
  })

  it('avoids ambiguous characters', () => {
    const slug = generateSlug(200)
    expect(slug).not.toMatch(/[l1o0]/)
  })

  it('does not repeat across calls', () => {
    const slugs = new Set(Array.from({ length: 50 }, () => generateSlug()))
    expect(slugs.size).toBe(50)
  })
})
