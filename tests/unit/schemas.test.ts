import { describe, expect, it } from 'vitest'
import {
  compareReportSchema,
  createAnalysisSchema,
  feedAuditSchema,
  visualReportSchema,
} from '@/lib/schemas'
import { SAMPLE_COMPARE_REPORT, SAMPLE_FEED_AUDIT, SAMPLE_VISUAL_REPORT } from '@/lib/sample-data'

describe('visualReportSchema', () => {
  it('accepts the bundled sample report', () => {
    expect(visualReportSchema.safeParse(SAMPLE_VISUAL_REPORT).success).toBe(true)
  })

  it('rejects a score above 100', () => {
    const result = visualReportSchema.safeParse({ ...SAMPLE_VISUAL_REPORT, visualScore: 101 })
    expect(result.success).toBe(false)
  })

  it('rejects a fractional score', () => {
    const result = visualReportSchema.safeParse({ ...SAMPLE_VISUAL_REPORT, visualScore: 71.5 })
    expect(result.success).toBe(false)
  })

  it('rejects confidence outside 0 to 1', () => {
    expect(visualReportSchema.safeParse({ ...SAMPLE_VISUAL_REPORT, confidence: 74 }).success).toBe(
      false
    )
  })

  it('rejects an empty first impression', () => {
    expect(
      visualReportSchema.safeParse({ ...SAMPLE_VISUAL_REPORT, firstImpression: '' }).success
    ).toBe(false)
  })

  it('requires every dimension to be present', () => {
    const { readability, ...rest } = SAMPLE_VISUAL_REPORT.dimensions
    void readability
    const result = visualReportSchema.safeParse({
      ...SAMPLE_VISUAL_REPORT,
      dimensions: rest,
    })
    expect(result.success).toBe(false)
  })

  it('caps priority improvements at five', () => {
    const tooMany = Array.from({ length: 6 }, (_, index) => ({
      ...SAMPLE_VISUAL_REPORT.priorityImprovements[0]!,
      priority: index + 1,
    }))
    expect(
      visualReportSchema.safeParse({ ...SAMPLE_VISUAL_REPORT, priorityImprovements: tooMany })
        .success
    ).toBe(false)
  })

  it('defaults optional list fields to empty arrays', () => {
    const { misunderstandingRisks, accessibilityConcerns, platformNotes, assumptions, ...rest } =
      SAMPLE_VISUAL_REPORT
    void misunderstandingRisks
    void accessibilityConcerns
    void platformNotes
    void assumptions
    const parsed = visualReportSchema.parse(rest)
    expect(parsed.accessibilityConcerns).toEqual([])
    expect(parsed.assumptions).toEqual([])
  })
})

describe('compareReportSchema', () => {
  it('accepts the bundled sample', () => {
    expect(compareReportSchema.safeParse(SAMPLE_COMPARE_REPORT).success).toBe(true)
  })

  it('rejects an unknown recommended variant', () => {
    expect(
      compareReportSchema.safeParse({ ...SAMPLE_COMPARE_REPORT, recommendedVariant: 'C' }).success
    ).toBe(false)
  })

  it('allows an honest tie', () => {
    const result = compareReportSchema.safeParse({
      ...SAMPLE_COMPARE_REPORT,
      recommendedVariant: 'Neither is clearly stronger',
    })
    expect(result.success).toBe(true)
  })
})

describe('feedAuditSchema', () => {
  it('accepts the bundled sample', () => {
    expect(feedAuditSchema.safeParse(SAMPLE_FEED_AUDIT).success).toBe(true)
  })

  it('requires exactly seven checklist items', () => {
    expect(
      feedAuditSchema.safeParse({
        ...SAMPLE_FEED_AUDIT,
        checklist: SAMPLE_FEED_AUDIT.checklist.slice(0, 5),
      }).success
    ).toBe(false)
  })

  it('requires exactly three directions', () => {
    expect(
      feedAuditSchema.safeParse({
        ...SAMPLE_FEED_AUDIT,
        directions: SAMPLE_FEED_AUDIT.directions.slice(0, 2),
      }).success
    ).toBe(false)
  })
})

describe('createAnalysisSchema', () => {
  const image = {
    storagePath: 'user-id/one.png',
    originalName: 'one.png',
    mimeType: 'image/png' as const,
    byteSize: 2048,
    role: 'primary' as const,
  }
  const base = {
    mode: 'visual_review' as const,
    visualType: 'Instagram post',
    platform: 'Instagram',
    targetAudience: 'New followers',
    goal: 'Stop the scroll',
    desiredImpression: 'Premium',
    images: [image],
  }

  it('accepts a single-image visual review', () => {
    expect(createAnalysisSchema.safeParse(base).success).toBe(true)
  })

  it('requires exactly two images for A/B Compare', () => {
    expect(createAnalysisSchema.safeParse({ ...base, mode: 'ab_compare' }).success).toBe(false)
    expect(
      createAnalysisSchema.safeParse({
        ...base,
        mode: 'ab_compare',
        images: [image, { ...image, role: 'variant_b' as const }],
      }).success
    ).toBe(true)
  })

  it('rejects two images for a single-visual mode', () => {
    expect(createAnalysisSchema.safeParse({ ...base, images: [image, image] }).success).toBe(false)
  })

  it('rejects an oversized image', () => {
    expect(
      createAnalysisSchema.safeParse({
        ...base,
        images: [{ ...image, byteSize: 9 * 1024 * 1024 }],
      }).success
    ).toBe(false)
  })

  it('rejects an unsupported mime type', () => {
    expect(
      createAnalysisSchema.safeParse({
        ...base,
        images: [{ ...image, mimeType: 'image/gif' }],
      }).success
    ).toBe(false)
  })
})
