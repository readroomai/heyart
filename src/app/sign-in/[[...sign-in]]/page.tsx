import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/logo'
import { isClerkConfigured, isPreviewAuthEnabled } from '@/lib/env'

export const metadata = { title: 'Sign in' }

export default async function SignInPage() {
  if (!isClerkConfigured()) {
    if (isPreviewAuthEnabled()) redirect('/app')
    redirect('/setup')
  }

  const { SignIn } = await import('@clerk/nextjs')

  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-line bg-ivory p-12 lg:flex">
        <Link href="/" aria-label="HiArt home">
          <Wordmark />
        </Link>
        <div>
          <p className="text-[clamp(1.6rem,2.4vw,2.4rem)] leading-[1.25] text-editorial">
            Before they read the caption,
            <br />
            <em className="italic">they see the creative.</em>
          </p>
          <p className="mt-6 max-w-sm text-sm text-ink-soft">
            Three reviews a day during the free beta. Nothing is published on your behalf.
          </p>
        </div>
        <p className="text-xs text-ink-soft">Made by Gia Macool and the HiArt team.</p>
      </div>

      <div className="flex items-center justify-center bg-white px-5 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden" aria-label="HiArt home">
            <Wordmark />
          </Link>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/app" />
        </div>
      </div>
    </main>
  )
}
