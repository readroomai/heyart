import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/logo'
import { isClerkConfigured, isPreviewAuthEnabled } from '@/lib/env'

export const metadata = { title: 'Create an account' }

export default async function SignUpPage() {
  if (!isClerkConfigured()) {
    if (isPreviewAuthEnabled()) redirect('/app')
    redirect('/setup')
  }

  const { SignUp } = await import('@clerk/nextjs')

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-line bg-ivory p-12 lg:flex">
        <Link href="/" aria-label="HiArt home">
          <Wordmark />
        </Link>
        <div>
          <p className="text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.25] text-editorial">
            Know how your visuals land
            <br />
            <em className="italic">before you publish them.</em>
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            {[
              'Three AI reviews every day, free during the beta.',
              'Visual Review, A/B Compare and Feed Audit.',
              'Private by default. No card required.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-coral"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-ink-soft">Made by Gia Macool and the HiArt team.</p>
      </div>

      <div className="flex items-center justify-center bg-white px-5 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden" aria-label="HiArt home">
            <Wordmark />
          </Link>
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/app" />
        </div>
      </div>
    </main>
  )
}
