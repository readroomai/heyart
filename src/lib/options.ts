/** Selectable option sets shared by the forms, the prompts and the tests. */

export const ANALYSIS_MODES = ['visual_review', 'ab_compare', 'feed_audit'] as const
export type AnalysisMode = (typeof ANALYSIS_MODES)[number]

export const MODE_LABELS: Record<AnalysisMode, string> = {
  visual_review: 'Visual Review',
  ab_compare: 'A/B Compare',
  feed_audit: 'Feed Audit',
}

export const MODE_DESCRIPTIONS: Record<AnalysisMode, string> = {
  visual_review: 'One visual, read the way an audience would read it.',
  ab_compare: 'Two variants, one clear creative recommendation.',
  feed_audit: 'A profile or feed screenshot, assessed as a whole.',
}

export const VISUAL_TYPES = [
  'Social-media graphic',
  'X post graphic',
  'Instagram post',
  'Advertisement',
  'Thumbnail',
  'Landing-page screenshot',
  'Product screenshot',
  'Logo',
  'Profile screenshot',
  'Presentation slide',
  'General visual',
] as const

export const PLATFORMS = [
  'X',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Website',
  'Advertisement',
  'Presentation',
  'General',
] as const

export const GOALS = [
  'Stop the scroll',
  'Build trust',
  'Look professional',
  'Communicate clearly',
  'Create curiosity',
  'Drive action',
  'Build authority',
  'Feel premium',
  'Feel authentic',
  'Launch a product',
] as const

export const IMPRESSIONS = [
  'Professional',
  'Premium',
  'Friendly',
  'Bold',
  'Trustworthy',
  'Modern',
  'Editorial',
  'Playful',
  'Serious',
  'Minimal',
] as const

export const AUDIENCES = [
  'Existing followers',
  'New followers',
  'Potential customers',
  'Existing customers',
  'Brand partners',
  'Investors',
  'Industry professionals',
  'General public',
  'Skeptics',
  'Young audience',
  'Premium buyers',
] as const

export const FAMILIARITY_LEVELS = [
  'Never heard of you',
  'Vaguely aware',
  'Follows you casually',
  'Knows you well',
] as const

export const KNOWLEDGE_LEVELS = ['Beginner', 'Informed', 'Expert'] as const

export const SENTIMENT_LEVELS = ['Sceptical', 'Neutral', 'Curious', 'Warm'] as const

export const DIMENSION_KEYS = [
  'attention',
  'clarity',
  'hierarchy',
  'trust',
  'professionalism',
  'brandFit',
  'originality',
  'platformFit',
  'readability',
] as const

export type DimensionKey = (typeof DIMENSION_KEYS)[number]

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  attention: 'Attention',
  clarity: 'Clarity',
  hierarchy: 'Visual hierarchy',
  trust: 'Trust',
  professionalism: 'Professionalism',
  brandFit: 'Brand fit',
  originality: 'Originality',
  platformFit: 'Platform fit',
  readability: 'Readability',
}

export const DIMENSION_HINTS: Record<DimensionKey, string> = {
  attention: 'How strongly the visual competes for a passing glance.',
  clarity: 'How quickly the core idea can be understood.',
  hierarchy: 'Whether the eye is guided in a deliberate order.',
  trust: 'How credible and legitimate the visual feels.',
  professionalism: 'Craft, finish and consistency of execution.',
  brandFit: 'Alignment with the stated brand or creator identity.',
  originality: 'Distinctiveness relative to category conventions.',
  platformFit: 'Suitability for the selected platform context.',
  readability: 'Legibility of type at realistic viewing sizes.',
}

/** Plain-language band so a score never depends on colour alone. */
export function scoreBand(score: number): string {
  if (score >= 85) return 'Very strong'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Workable'
  if (score >= 40) return 'Needs work'
  return 'Weak'
}

export const BETA_DAILY_ANALYSIS_LIMIT = 3
export const BETA_BRAND_PROFILE_LIMIT = 3
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
export const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const
