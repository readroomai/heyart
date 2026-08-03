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
      maxOutputTokens: 8192,
    },
  })
  const text = response.text
  if (!text) throw new AiResponseError('The model returned an empty response.')
  return text
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

  const first = await callModel(params.prompt, params.images, model)
  const firstParsed = params.schema.safeParse(safeParseJson(first))
  if (firstParsed.success) return { data: firstParsed.data, model }

  const correction = buildCorrectionPrompt(params.prompt, describeIssues(firstParsed.error))
  const second = await callModel(correction, params.images, model)
  const secondParsed = params.schema.safeParse(safeParseJson(second))
  if (secondParsed.success) return { data: secondParsed.data, model }

  throw new AiResponseError(
    'The review came back in an unexpected shape. Nothing was saved — please try again.'
  )
}
