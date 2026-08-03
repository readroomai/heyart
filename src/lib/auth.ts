import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb, schema } from './db'
import { isClerkConfigured, isPreviewAuthEnabled } from './env'
import type { UserRow } from './db/schema'

export class UnauthorizedError extends Error {
  constructor(message = 'Sign in to continue.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export type ClerkIdentity = {
  clerkUserId: string
  displayName: string | null
  email: string | null
}

const PREVIEW_IDENTITY: ClerkIdentity = {
  clerkUserId: 'preview_local_user',
  displayName: 'Preview user',
  email: null,
}

/**
 * Resolves the signed-in identity on the server. The browser never supplies a
 * user id — it is always read back from the Clerk session.
 */
export async function getIdentity(): Promise<ClerkIdentity | null> {
  if (isClerkConfigured()) {
    const { currentUser } = await import('@clerk/nextjs/server')
    const user = await currentUser()
    if (!user) return isPreviewAuthEnabled() ? PREVIEW_IDENTITY : null
    const email = user.primaryEmailAddress?.emailAddress ?? null
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || null
    return { clerkUserId: user.id, displayName: name, email }
  }
  return isPreviewAuthEnabled() ? PREVIEW_IDENTITY : null
}

export async function requireIdentity(): Promise<ClerkIdentity> {
  const identity = await getIdentity()
  if (!identity) throw new UnauthorizedError()
  return identity
}

/**
 * Idempotent lazy upsert. Safe to call on every request: a unique index on
 * clerk_user_id makes concurrent first-visits converge on one row.
 */
export async function upsertUser(identity: ClerkIdentity): Promise<UserRow> {
  const db = getDb()
  const [row] = await db
    .insert(schema.users)
    .values({
      clerkUserId: identity.clerkUserId,
      displayName: identity.displayName,
      email: identity.email,
    })
    .onConflictDoUpdate({
      target: schema.users.clerkUserId,
      set: {
        displayName: identity.displayName,
        email: identity.email,
        updatedAt: new Date(),
      },
    })
    .returning()

  if (row) return row

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.clerkUserId, identity.clerkUserId),
  })
  if (!existing) throw new Error('Could not create the user record.')
  return existing
}

/** The identity plus its database row. Every app request starts here. */
export async function requireUser(): Promise<UserRow> {
  const identity = await requireIdentity()
  return upsertUser(identity)
}

/**
 * Ownership guard used by every record-scoped route. Returns false rather
 * than throwing so callers can choose between 403 and 404 semantics.
 */
export function ownsRecord(record: { userId: string } | null | undefined, userId: string) {
  return Boolean(record && record.userId === userId)
}
