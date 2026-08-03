'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Wordmark } from '@/components/logo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Message only — never the full stack, and never any request payload.
    console.error(`[hiart] render error: ${error.message}`)
  }, [error])

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <Wordmark className="mx-auto" />
        <h1 className="mt-10 text-section text-editorial">Something went wrong.</h1>
        <p className="mt-4 text-lede text-ink-soft">
          That is on us, not on your work. Try again, and if it keeps happening the report was not
          saved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/app" className="btn-secondary">
            Back to the studio
          </Link>
        </div>
      </div>
    </main>
  )
}
