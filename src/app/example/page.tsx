import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { ExampleTabs } from '@/components/marketing/example-tabs'
import { getIdentity } from '@/lib/auth'

export const metadata = {
  title: 'Example report',
  description:
    'A complete HiArt visual review, generated in advance so you can read a full report before signing up.',
}

export default async function ExamplePage() {
  const identity = await getIdentity().catch(() => null)

  return (
    <>
      <SiteHeader signedIn={Boolean(identity)} />
      <main id="main">
        <section className="border-b border-line">
          <div className="shell py-14 lg:py-20">
            <p className="eyebrow">Example report</p>
            <h1 className="mt-5 max-w-3xl text-display text-editorial">
              This is what HiArt hands back <em className="italic">every time.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lede text-ink-soft">
              A complete review of a sample creative, generated in advance. Nothing here calls the
              model — it is the same structure your own reviews use.
            </p>
            <Link href="/app/new" className="btn-primary mt-8">
              Review your own visual
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="shell py-14 lg:py-20">
          <ExampleTabs />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
