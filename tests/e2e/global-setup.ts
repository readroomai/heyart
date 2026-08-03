import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Resets the local preview database before the suite so runs are repeatable —
 * the daily review limit is real, and a stale database would exhaust it.
 */
export default function globalSetup() {
  rmSync(join(process.cwd(), '.data'), { recursive: true, force: true })
  execFileSync('npx', ['tsx', 'scripts/seed-preview.ts'], { stdio: 'inherit' })
}
