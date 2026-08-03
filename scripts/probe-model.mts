/**
 * Diagnostic: runs one real Visual Review prompt and reports how the model
 * terminated. Useful when tuning GEMINI_MODEL or the output budget.
 *
 *   npx tsx --env-file=.env.local scripts/probe-model.mts
 */
import { GoogleGenAI } from '@google/genai'
import { readFileSync } from 'node:fs'
import { buildVisualReviewPrompt } from '../src/lib/prompts'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
const prompt = buildVisualReviewPrompt({
  mode: 'visual_review',
  visualType: 'Instagram post',
  platform: 'Instagram',
  targetAudience: 'New followers',
  goal: 'Stop the scroll',
  desiredImpression: 'Premium',
  context: '',
})
const b64 = readFileSync('tests/fixtures/sample-upload.png').toString('base64')

const budget = Number(process.env.PROBE_TOKENS || 8192)
const response = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL!,
  contents: [
    {
      role: 'user',
      parts: [{ text: prompt }, { inlineData: { mimeType: 'image/png', data: b64 } }],
    },
  ],
  config: { responseMimeType: 'application/json', temperature: 0.6, maxOutputTokens: budget },
})

const text = response.text ?? ''
console.log('finishReason:', response.candidates?.[0]?.finishReason)
console.log('usage:', JSON.stringify(response.usageMetadata))
console.log('textLength:', text.length)
console.log('tail:', JSON.stringify(text.slice(-160)))
