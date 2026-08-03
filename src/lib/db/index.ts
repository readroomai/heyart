import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { serverEnv, isPreviewAuthEnabled } from '../env'
import * as schema from './schema'
import { toPreviewSql } from './preview-schema'

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

type Db = {
  query: ReturnType<typeof drizzle<typeof schema>>['query']
  insert: ReturnType<typeof drizzle<typeof schema>>['insert']
  update: ReturnType<typeof drizzle<typeof schema>>['update']
  delete: ReturnType<typeof drizzle<typeof schema>>['delete']
  select: ReturnType<typeof drizzle<typeof schema>>['select']
}

let cached: Db | null = null

/**
 * Lazily opens a single pooled connection. Throws a typed configuration error
 * rather than crashing the process when the database URL is absent, so the
 * app can render a "finish setup" state instead of a stack trace.
 *
 * In local preview mode (see env.ts) an in-process PGlite database is used
 * instead, so the product can be run and tested before Supabase exists.
 * Production always uses the Supabase connection string.
 */
export function getDb(): Db {
  if (cached) return cached
  const url = serverEnv.databaseUrl

  if (!url) {
    if (isPreviewAuthEnabled()) {
      cached = getPreviewDb()
      return cached
    }
    throw new ConfigurationError(
      'SUPABASE_DATABASE_URL is not set. Add it to .env.local to enable saved analyses.'
    )
  }

  const client = postgres(url, { prepare: false, max: 5 })
  cached = drizzle(client, { schema })
  return cached
}

/* ------------------------------------------------------------------ */
/* Local preview database                                              */
/* ------------------------------------------------------------------ */

let previewDb: Db | null = null

function getPreviewDb(): Db {
  if (previewDb) return previewDb
  // Required synchronously by design: these modules are dev-only.
  const { PGlite } = require('@electric-sql/pglite')
  const { drizzle: drizzlePglite } = require('drizzle-orm/pglite')
  const { readFileSync } = require('node:fs') as typeof import('node:fs')
  const { join } = require('node:path') as typeof import('node:path')

  const client = new PGlite(join(process.cwd(), '.data', 'preview-db'))
  const db = drizzlePglite(client, { schema })

  // PGlite has no storage schema or RLS; keep only the table definitions.
  const migration = toPreviewSql(
    readFileSync(join(process.cwd(), 'drizzle', '0000_init.sql'), 'utf8')
  )

  void client.exec(migration).catch((error: Error) => {
    console.error(`[hiart] preview database init failed: ${error.message}`)
  })

  previewDb = db
  return db
}

export { schema }
