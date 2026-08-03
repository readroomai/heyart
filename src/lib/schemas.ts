import { z } from 'zod'
import {
  ANALYSIS_MODES,
  BETA_BRAND_PROFILE_LIMIT,
  DIMENSION_KEYS,
  FAMILIARITY_LEVELS,
  KNOWLEDGE_LEVELS,
  SENTIMENT_LEVELS,
} from './options'

const score = z.number().int().min(0).max(100)
const shortText = z.string().min(1).max(400)
const longText = z.string().min(1).max(4000)

const dimension = z.object({
  score,
  reason: shortText,
})

const dimensionsShape = Object.fromEntries(DIMENSION_KEYS.map((key) => [key, dimension])) as Record<
  (typeof DIMENSION_KEYS)[number],
  typeof dimension
>

export const dimensionsSchema = z.object(dimensionsShape)

export const attentionStepSchema = z.object({
  order: z.number().int().min(1).max(10),
  element: shortText,
  reason: shortText,
})

export const audienceReadSchema = z.object({
  audience: shortText,
  interpretation: shortText,
  positiveSignal: shortText,
  concern: shortText,
})

export const priorityImprovementSchema = z.object({
  priority: z.number().int().min(1).max(10),
  change: shortText,
  why: shortText,
  how: shortText,
  expectedEffect: shortText,
})

/** The Visual Review report. Also the base for the other two modes. */
export const visualReportSchema = z.object({
  title: z.string().min(1).max(120),
  visualScore: score,
  firstImpression: shortText,
  primaryMessage: shortText,
  likelyEmotionalResponse: shortText,
  intendedMessageAlignment: shortText,
  attentionPath: z.array(attentionStepSchema).min(1).max(6),
  dimensions: dimensionsSchema,
  audienceReads: z.array(audienceReadSchema).min(1).max(6),
  whatWorks: z.array(shortText).min(1).max(8),
  whatWeakensIt: z.array(shortText).min(1).max(8),
  misunderstandingRisks: z.array(shortText).max(8).default([]),
  accessibilityConcerns: z.array(shortText).max(8).default([]),
  platformNotes: z.array(shortText).max(8).default([]),
  priorityImprovements: z.array(priorityImprovementSchema).min(1).max(5),
  preserve: z.array(shortText).min(1).max(8),
  revisionBrief: longText,
  creativeRevisionPrompt: longText,
  assumptions: z.array(shortText).max(8).default([]),
  confidence: z.number().min(0).max(1),
})

export type VisualReport = z.infer<typeof visualReportSchema>

/** A/B Compare adds a verdict on top of one report per variant. */
export const compareReportSchema = z.object({
  title: z.string().min(1).max(120),
  recommendedVariant: z.enum(['A', 'B', 'Neither is clearly stronger']),
  verdict: shortText,
  variantA: visualReportSchema,
  variantB: visualReportSchema,
  criteria: z
    .array(
      z.object({
        criterion: shortText,
        winner: z.enum(['A', 'B', 'Tie']),
        reason: shortText,
      })
    )
    .min(4)
    .max(8),
  majorTradeOff: shortText,
  strongestFromA: z.array(shortText).min(1).max(5),
  strongestFromB: z.array(shortText).min(1).max(5),
  combinedDirection: longText,
  assumptions: z.array(shortText).max(8).default([]),
  confidence: z.number().min(0).max(1),
})

export type CompareReport = z.infer<typeof compareReportSchema>

/** Feed Audit assesses a profile or gallery screenshot as one body of work. */
export const feedAuditSchema = z.object({
  title: z.string().min(1).max(120),
  visualScore: score,
  immediatePositioning: shortText,
  appearsToBeAbout: shortText,
  remainsUnclear: z.array(shortText).min(1).max(6),
  dimensions: z.object({
    consistency: dimension,
    recognition: dimension,
    variety: dimension,
    professionalism: dimension,
    trust: dimension,
  }),
  repetition: z.array(shortText).max(6).default([]),
  conflictingStyles: z.array(shortText).max(6).default([]),
  trustSignals: z.array(shortText).max(6).default([]),
  directions: z
    .array(
      z.object({
        name: shortText,
        description: shortText,
        tradeOff: shortText,
      })
    )
    .length(3),
  checklist: z.array(shortText).length(7),
  revisionBrief: longText,
  creativeRevisionPrompt: longText,
  assumptions: z.array(shortText).max(8).default([]),
  confidence: z.number().min(0).max(1),
})

export type FeedAuditReport = z.infer<typeof feedAuditSchema>

export type AnyReport = VisualReport | CompareReport | FeedAuditReport

export function schemaForMode(mode: (typeof ANALYSIS_MODES)[number]) {
  if (mode === 'ab_compare') return compareReportSchema
  if (mode === 'feed_audit') return feedAuditSchema
  return visualReportSchema
}

/* ------------------------------------------------------------------ */
/* Request payloads                                                    */
/* ------------------------------------------------------------------ */

export const customAudienceSchema = z.object({
  name: z.string().min(1).max(80),
  familiarity: z.enum(FAMILIARITY_LEVELS),
  knowledge: z.enum(KNOWLEDGE_LEVELS),
  sentiment: z.enum(SENTIMENT_LEVELS),
  cares: z.string().max(300).optional().default(''),
  desiredReaction: z.string().max(300).optional().default(''),
  context: z.string().max(500).optional().default(''),
})

export type CustomAudience = z.infer<typeof customAudienceSchema>

export const uploadedImageSchema = z.object({
  storagePath: z.string().min(1),
  originalName: z.string().min(1).max(255),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  byteSize: z
    .number()
    .int()
    .positive()
    .max(8 * 1024 * 1024),
  role: z.enum(['primary', 'variant_a', 'variant_b', 'feed']),
})

export const createAnalysisSchema = z
  .object({
    mode: z.enum(ANALYSIS_MODES),
    visualType: z.string().min(1).max(80),
    platform: z.string().min(1).max(40),
    targetAudience: z.string().min(1).max(120),
    customAudience: customAudienceSchema.optional(),
    goal: z.string().min(1).max(120),
    desiredImpression: z.string().min(1).max(120),
    context: z.string().max(1200).optional().default(''),
    brandProfileId: z.string().uuid().optional().nullable(),
    images: z.array(uploadedImageSchema).min(1).max(2),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'ab_compare' && value.images.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images'],
        message: 'A/B Compare needs exactly two images.',
      })
    }
    if (value.mode !== 'ab_compare' && value.images.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images'],
        message: 'This mode takes exactly one image.',
      })
    }
  })

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>

const hexColour = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex colour such as #F26445')

export const brandProfileSchema = z.object({
  name: z.string().min(1, 'Give the profile a name').max(80),
  description: z.string().max(600).optional().default(''),
  targetAudience: z.string().max(300).optional().default(''),
  personality: z.string().max(300).optional().default(''),
  desiredImpression: z.string().max(120).optional().default(''),
  primaryPlatform: z.string().max(40).optional().default(''),
  primaryColours: z.array(hexColour).max(5).optional().default([]),
  secondaryColours: z.array(hexColour).max(5).optional().default([]),
  positiveWords: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
  negativeWords: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
  logoStoragePath: z.string().max(400).optional().nullable(),
  referenceStoragePath: z.string().max(400).optional().nullable(),
  isDefault: z.boolean().optional().default(false),
})

export type BrandProfileInput = z.infer<typeof brandProfileSchema>

export const updateAnalysisSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  isFavourite: z.boolean().optional(),
})

export const shareLinkSchema = z.object({
  analysisId: z.string().uuid(),
  revealImages: z.boolean().optional().default(false),
})

export const BRAND_PROFILE_LIMIT = BETA_BRAND_PROFILE_LIMIT
