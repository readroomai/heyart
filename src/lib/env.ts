/**
 * Central environment access. Nothing else in the codebase reads process.env
 * for these values, so a missing key produces one consistent, friendly state.
 */

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/** The single source of truth for the vision model identifier. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview'

export const serverEnv = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  databaseUrl: process.env.SUPABASE_DATABASE_URL,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
}

export const publicEnv = {
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
}

export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv.databaseUrl)
}

export function isStorageConfigured(): boolean {
  return Boolean(serverEnv.supabaseUrl && serverEnv.supabaseServiceRoleKey)
}

export function isAiConfigured(): boolean {
  return Boolean(serverEnv.googleApiKey)
}

/**
 * Local preview identity. Lets the product be run, screenshotted and
 * end-to-end tested before Clerk credentials exist. Never available in a
 * production build, and never enabled unless explicitly opted into.
 */
export function isPreviewAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.HIART_PREVIEW_AUTH === '1'
}

/** Returns every piece of configuration that is missing, for setup screens. */
export function missingConfiguration(): string[] {
  const missing: string[] = []
  if (!isClerkConfigured() && !isPreviewAuthEnabled()) missing.push('Clerk authentication')
  if (!isDatabaseConfigured()) missing.push('Supabase database')
  if (!isStorageConfigured()) missing.push('Supabase storage')
  if (!isAiConfigured()) missing.push('Google GenAI API key')
  return missing
}
