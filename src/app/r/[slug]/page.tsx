import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { SiteFooter } from '@/components/site/footer'
import { PublicReport } from '@/components/report/public-report'
import { getDb, schema, ConfigurationError } from '@/lib/db'
import { isShareLinkUsable, toPublicShare } from '@/lib/share'
import { createSignedUrl } from '@/lib/storage'
import { MODE_LABELS, type AnalysisMode } from '@/lib/options'

export const dynamic = 'force-dynamic'

async function loadShare(slug: string) {
  const db = getDb()
  const link = await db.query.shareLinks.findFirst({
    where: eq(schema.shareLinks.slug, slug),
  })
  if (!link || !isShareLinkUsable(link)) return null

  const analysis = await db.query.analyses.findFirst({
    where: eq(schema.analyses.id, link.analysisId),
  })
  if (!analysis || analysis.status !== 'complete') return null

  // Images are only signed when the owner has explicitly revealed them.
  let previews: { url: string; label: string }[] = []
  if (link.revealImages) {
    const images = await db.query.analysisImages.findMany({
      where: eq(schema.analysisImages.analysisId, analysis.id),
    })
    const ordered = [...images].sort((a, b) => a.imageRole.localeCompare(b.imageRole))
    previews = (
      await Promise.all(
        ordered.map(async (image) => ({
          url: await createSignedUrl(image.storagePath).catch(() => ''),
          // The original filename is not shown publicly.
          label: 'Reviewed visual',
        }))
      )
    ).filter((preview) => preview.url)
  }

  return { share: toPublicShare(analysis, link), previews }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const data = await loadShare(slug)
    if (!data) return { title: 'Report unavailable' }
    return {
      title: data.share.title,
      description: `A HiArt visual review — ${data.share.platform}, ${data.share.goal}.`,
    }
  } catch {
    return { title: 'Report unavailable' }
  }
}

export default async function SharedReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let data: Awaited<ReturnType<typeof loadShare>> = null
  try {
    data = await loadShare(slug)
  } catch (error) {
    if (error instanceof ConfigurationError) notFound()
    throw error
  }

  if (!data) {
    return (
      <main id="main" className="flex min-h-dvh items-center justify-center px-5 py-20">
        <div className="max-w-md text-center">
          <Wordmark className="mx-auto" />
          <h1 className="mt-8 text-section text-editorial">This link is no longer active.</h1>
          <p className="mt-4 text-lede text-ink-soft">
            The person who shared this report has revoked the link, or it has expired.
          </p>
          <Link href="/" className="btn-primary mt-8">
            See what HiArt does
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    )
  }

  const { share, previews } = data

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-ivory/90 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="HiArt home">
            <Wordmark />
          </Link>
          <Link href="/app/new" className="btn-primary">
            Review your own visual
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="border-b border-line">
          <div className="shell py-12 lg:py-16">
            <p className="eyebrow">
              Shared review · {MODE_LABELS[share.mode as AnalysisMode] ?? share.mode}
            </p>
            <h1 className="mt-5 max-w-3xl text-display text-editorial">{share.title}</h1>
            <p className="mt-5 text-sm text-ink-soft">
              {share.platform} · {share.goal} · {share.desiredImpression} ·{' '}
              {new Date(share.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </section>

        <section className="shell py-12 lg:py-16">
          <PublicReport
            mode={share.mode}
            report={share.result}
            previews={previews}
            revealImages={share.revealImages}
          />
        </section>

        <section className="border-t border-line bg-ink text-ivory">
          <div className="shell py-section text-center">
            <p className="font-mono text-label uppercase tracking-[0.16em] text-ivory/50">
              Made with HiArt
            </p>
            <h2 className="mx-auto mt-6 max-w-2xl text-section text-editorial">
              Know how your visuals land
              <br />
              <em className="italic">before you publish them.</em>
            </h2>
            <Link
              href="/app/new"
              className="btn mt-9 rounded-frame bg-ivory px-6 py-3.5 text-sm font-medium text-ink hover:bg-white"
            >
              Review a visual
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
