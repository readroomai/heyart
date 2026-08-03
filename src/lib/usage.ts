import 'server-only'
import { and, count, eq, gte, inArray, lt } from 'drizzle-orm'
import { getDb, schema } from './db'
import { BETA_DAILY_ANALYSIS_LIMIT, BETA_BRAND_PROFILE_LIMIT } from './options'

export const DAILY_LIMIT_MESSAGE =
  'You have used today’s three beta reviews. Your limit resets tomorrow.'

/** Start and end of the current UTC day. Limits reset at 00:00 UTC. */
export function utcDayBounds(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  )
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

export type UsageSnapshot = {
  used: number
  limit: number
  remaining: number
  resetsAt: Date
}

/**
 * Counts analyses that succeeded or are still running. Rows that failed
 * validation do not consume the daily allowance.
 */
export async function getDailyUsage(
  userId: string,
  now: Date = new Date()
): Promise<UsageSnapshot> {
  const db = getDb()
  const { start, end } = utcDayBounds(now)
  const [row] = await db
    .select({ value: count() })
    .from(schema.analyses)
    .where(
      and(
        eq(schema.analyses.userId, userId),
        gte(schema.analyses.createdAt, start),
        lt(schema.analyses.createdAt, end),
        inArray(schema.analyses.status, ['complete', 'processing'])
      )
    )
  const used = row?.value ?? 0
  return {
    used,
    limit: BETA_DAILY_ANALYSIS_LIMIT,
    remaining: Math.max(0, BETA_DAILY_ANALYSIS_LIMIT - used),
    resetsAt: end,
  }
}

export async function assertWithinDailyLimit(userId: string): Promise<UsageSnapshot> {
  const usage = await getDailyUsage(userId)
  if (usage.remaining <= 0) {
    const error = new Error(DAILY_LIMIT_MESSAGE)
    error.name = 'DailyLimitError'
    throw error
  }
  return usage
}

export async function countBrandProfiles(userId: string): Promise<number> {
  const db = getDb()
  const [row] = await db
    .select({ value: count() })
    .from(schema.brandProfiles)
    .where(eq(schema.brandProfiles.userId, userId))
  return row?.value ?? 0
}

export async function assertBrandProfileCapacity(userId: string): Promise<void> {
  const existing = await countBrandProfiles(userId)
  if (existing >= BETA_BRAND_PROFILE_LIMIT) {
    const error = new Error(
      `The free beta allows ${BETA_BRAND_PROFILE_LIMIT} Brand Profiles. Delete one to add another.`
    )
    error.name = 'BrandProfileLimitError'
    throw error
  }
}

export async function recordUsageEvent(userId: string, eventType: string, model: string) {
  const db = getDb()
  await db.insert(schema.usageEvents).values({ userId, eventType, model })
}
