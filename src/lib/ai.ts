import 'server-only'
import { GoogleGenAI } from '@google/genai'
import type { ZodTypeAny, z } from 'zod'
import { GEMINI_MODEL, serverEnv } from './env'
import { buildCorrectionPrompt } from './prompts'

export class AiConfigurationError extends Error {
  constructor() {
    super('GOOGLE_API_KEY is not set, so reviews cannot run yet.')
    this.name = 'AiConfigurationError'
  }
}

export class AiResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiResponseError'
  }
}

/** The provider is up but temporarily refusing work — worth retrying later. */
export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiUnavailableError'
  }
}

/** Recognises provider overload and rate limiting from the SDK's error shape. */
export function asUnavailable(error: unknown): AiUnavailableError | null {
  const message = error instanceof Error ? error.message : String(error)
  if (
    /\b(503|429)\b/.test(message) ||
    /UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(message)
  ) {
    return new AiUnavailableError(
      /429|RESOURCE_EXHAUSTED/i.test(message)
        ? 'The AI provider is rate limiting us right now. Wait a moment and try again — this review was not counted.'
        : 'The vision model is busy right now. Try again in a moment — this review was not counted.'
    )
  }
  return null
}

export type ImagePart = { base64: string; mimeType: string }

let cached: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (cached) return cached
  if (!serverEnv.googleApiKey) throw new AiConfigurationError()
  cached = new GoogleGenAI({ apiKey: serverEnv.googleApiKey })
  return cached
}

/**
 * Test-only provider stub. Never available in a production build, and the
 * real integration below is untouched by it.
 */
function isMockAiEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.HIART_MOCK_AI === '1'
}

async function mockReport<TSchema extends ZodTypeAny>(
  mode: 'visual_review' | 'ab_compare' | 'feed_audit',
  schema: TSchema
): Promise<{ data: z.infer<TSchema> }> {
  const samples = await import('./sample-data')
  const fixture =
    mode === 'ab_compare'
      ? samples.SAMPLE_COMPARE_REPORT
      : mode === 'feed_audit'
        ? samples.SAMPLE_FEED_AUDIT
        : samples.SAMPLE_VISUAL_REPORT
  // The fixture still goes through the same validation the model output does.
  return { data: schema.parse(fixture) }
}

/** Strips a markdown fence and any prose around the JSON body. */
export function extractJson(raw: string): string {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence && fence[1]) text = fence[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new AiResponseError('The model did not return a JSON object.')
  }
  return text.slice(start, end + 1)
}

export function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(extractJson(raw))
  } catch {
    throw new AiResponseError('The model returned malformed JSON.')
  }
}

type ParseAttempt<T> = { ok: true; data: T } | { ok: false; issues: string }

/**
 * Parses and validates one reply. Both failure kinds — unreadable JSON and a
 * shape that misses the schema — come back as feedback the model can act on.
 */
function attemptParse<TSchema extends ZodTypeAny>(
  raw: string,
  schema: TSchema
): ParseAttempt<z.infer<TSchema>> {
  let value: unknown
  try {
    value = safeParseJson(raw)
  } catch {
    return {
      ok: false,
      issues:
        '- (root): the reply was not valid JSON. It may have been cut off. Return a single complete JSON object and keep every string short.',
    }
  }

  const parsed = schema.safeParse(value)
  if (parsed.success) return { ok: true, data: parsed.data }
  return { ok: false, issues: describeIssues(parsed.error) }
}

/** Human-readable summary of Zod issues, fed back to the model on retry. */
function describeIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 12)
    .map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
}

async function callModel(prompt: string, images: ImagePart[], model: string): Promise<string> {
  const client = getClient()
  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          ...images.map((image) => ({
            inlineData: { mimeType: image.mimeType, data: image.base64 },
          })),
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.6,
      // Reasoning models spend thinking tokens against this same budget, so
      // it has to comfortably exceed the size of a full report.
      maxOutputTokens: 16384,
    },
  })
  const text = response.text
  if (!text) throw new AiResponseError('The model returned an empty response.')
  return text
}

/** Wraps a call so provider overload surfaces as a retryable, honest error. */
async function callModelSafely(
  prompt: string,
  images: ImagePart[],
  model: string
): Promise<string> {
  try {
    return await callModel(prompt, images, model)
  } catch (error) {
    const unavailable = asUnavailable(error)
    if (unavailable) throw unavailable
    throw error
  }
}

/**
 * Runs the analysis and validates it. One corrective retry is attempted when
 * the first reply fails the schema; a second failure surfaces as a friendly
 * error and nothing malformed is ever treated as a success.
 */
export async function generateReport<TSchema extends ZodTypeAny>(params: {
  prompt: string
  images: ImagePart[]
  schema: TSchema
  model?: string
  /** Only used to pick a fixture when the provider is mocked in tests. */
  mode?: 'visual_review' | 'ab_compare' | 'feed_audit'
}): Promise<{ data: z.infer<TSchema>; model: string }> {
  const model = params.model || GEMINI_MODEL

  if (isMockAiEnabled()) {
    const { data } = await mockReport(params.mode ?? 'visual_review', params.schema)
    return { data, model: `${model} (mocked)` }
  }

  // A truncated or fenced reply must reach the corrective retry too, not just
  // one that parsed cleanly and then failed the schema.
  const first = attemptParse(
    await callModelSafely(params.prompt, params.images, model),
    params.schema
  )
  if (first.ok) return { data: first.data, model }

  const correction = buildCorrectionPrompt(params.prompt, first.issues)
  const second = attemptParse(
    await callModelSafely(correction, params.images, model),
    params.schema
  )
  if (second.ok) return { data: second.data, model }

  throw new AiResponseError(
    'The review came back in an unexpected shape. Nothing was saved — please try again.'
  )
}
