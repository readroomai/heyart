import Link from 'next/link'
import { Wordmark } from '@/components/logo'

/**
 * Shown instead of a stack trace when a required service is missing. It says
 * exactly which environment variables to set.
 */
export function ConfigurationNotice({ missing }: { missing: string[] }) {
  const VARIABLES: Record<string, string[]> = {
    'Clerk authentication': ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
    'Supabase database': ['SUPABASE_DATABASE_URL'],
    'Supabase storage': ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    'Google GenAI API key': ['GOOGLE_API_KEY'],
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">
        <Wordmark />
        <h1 className="mt-8 text-section text-editorial">Finish the setup.</h1>
        <p className="mt-4 text-lede text-ink-soft">
          HiArt needs a few credentials before reviews can run. Add these to{' '}
          <code className="font-mono text-sm text-ink">.env.local</code> and restart the server.
        </p>

        <div className="mt-8 border border-line">
          {missing.map((item) => (
            <div key={item} className="border-b border-line p-5 last:border-b-0">
              <h2 className="text-sm font-medium text-ink">{item}</h2>
              <ul className="mt-3 space-y-1.5">
                {(VARIABLES[item] ?? []).map((variable) => (
                  <li key={variable} className="font-mono text-[13px] text-ink-soft">
                    {variable}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          The full list is in <code className="font-mono text-ink">.env.example</code>, with setup
          steps in the README.
        </p>

        <Link href="/" className="btn-secondary mt-8">
          Back to the site
        </Link>
      </div>
    </div>
  )
}
