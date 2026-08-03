import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/logo'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <Wordmark className="mx-auto" />
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          Error 404
        </p>
        <h1 className="mt-5 text-section text-editorial">
          Nothing framed <em className="italic">here.</em>
        </h1>
        <p className="mt-4 text-lede text-ink-soft">That page does not exist, or it was removed.</p>
        <Link href="/" className="btn-primary mt-8">
          Back to HiArt
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}
