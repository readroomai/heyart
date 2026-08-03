/**
 * Strips the Supabase-only statements from the migration so the same SQL can
 * initialise the local preview database (which has no storage schema or RLS).
 */
export function toPreviewSql(migration: string): string {
  return (
    migration
      .replace(/insert into storage\.buckets[\s\S]*?on conflict \(id\) do nothing;/gi, '')
      .split('\n')
      // gen_random_uuid() is in the Postgres core since 13, so pgcrypto — which
      // PGlite does not ship — is only needed by the Supabase migration.
      .filter(
        (line) =>
          !/enable row level security/i.test(line) && !/create extension .*pgcrypto/i.test(line)
      )
      .join('\n')
  )
}
