/**
 * Applies drizzle/0000_init.sql to the Supabase database.
 *
 *   npm run db:migrate
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

async function main() {
  const url = process.env.SUPABASE_DATABASE_URL
  if (!url) {
    console.error('SUPABASE_DATABASE_URL is not set.')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1, prepare: false })
  const migration = readFileSync(join(process.cwd(), 'drizzle', '0000_init.sql'), 'utf8')

  try {
    await sql.unsafe(migration)
    console.log('Schema applied.')
  } catch (error) {
    // The storage bucket insert fails on a database without the storage
    // schema; everything else must still succeed.
    const message = (error as Error).message
    if (message.includes('storage.buckets')) {
      console.warn('Tables created. Create the "hiart-uploads" private bucket in the dashboard.')
    } else {
      throw error
    }
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
