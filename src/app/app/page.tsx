import Link from 'next/link'
import { ArrowRight, Columns2, Grid3x3, SquarePen } from 'lucide-react'
import { loadRecentAnalyses, loadWorkspace } from '@/lib/app-data'
import { MODE_DESCRIPTIONS, MODE_LABELS, type AnalysisMode } from '@/lib/options'
import { AnalysisCard } from '@/components/app/analysis-card'

export const metadata = { title: 'Dashboard' }

const MODES: { mode: AnalysisMode; href: string; icon: typeof SquarePen }[] = [
  { mode: 'visual_review', href: '/app/new', icon: SquarePen },
  { mode: 'ab_compare', href: '/app/compare', icon: Columns2 },
  { mode: 'feed_audit', href: '/app/audit', icon: Grid3x3 },
]

export default async function DashboardPage() {
  const { user, brandProfiles, usage } = await loadWorkspace()
  const recent = await loadRecentAnalyses(user.id)
  const defaultProfile = brandProfiles.find((profile) => profile.isDefault)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <header>
        <p className="eyebrow">Studio</p>
        <h1 className="mt-4 text-section text-editorial">
          What are we <em className="italic">looking at</em> today?
        </h1>
      </header>

      <section className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
        {MODES.map(({ mode, href, icon: Icon }) => (
          <Link
            key={mode}
            href={href}
            className="group bg-white p-6 transition-colors hover:bg-ivory"
          >
            <Icon className="h-5 w-5 text-ink" aria-hidden="true" />
            <h2 className="mt-5 text-lg text-editorial">{MODE_LABELS[mode]}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{MODE_DESCRIPTIONS[mode]}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink">
              Start
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
        <div className="bg-white p-6">
          <p className="eyebrow">Reviews left today</p>
          <p className="tnum mt-3 text-editorial text-4xl">
            {usage.remaining}
            <span className="text-lg text-ink-soft"> / {usage.limit}</span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {usage.remaining === 0
              ? 'You have used today’s three beta reviews. Your limit resets tomorrow.'
              : 'Free beta. Resets at midnight UTC.'}
          </p>
        </div>
        <div className="bg-white p-6">
          <p className="eyebrow">Default Brand Profile</p>
          {defaultProfile ? (
            <>
              <p className="mt-3 text-2xl text-editorial">{defaultProfile.name}</p>
              <Link
                href="/app/brand-profiles"
                className="mt-3 inline-block text-sm text-cobalt underline underline-offset-4"
              >
                Manage profiles
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-ink-soft">
                No profile yet. Add one so brand fit is judged against your actual identity.
              </p>
              <Link
                href="/app/brand-profiles"
                className="mt-3 inline-block text-sm text-cobalt underline underline-offset-4"
              >
                Create a Brand Profile
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <h2 className="eyebrow">Recent reviews</h2>
          {recent.length > 0 && (
            <Link href="/app/history" className="text-sm text-ink-soft hover:text-ink">
              View all
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="text-lg text-editorial">Nothing reviewed yet.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
              Upload a post, thumbnail, advertisement or screenshot and HiArt will tell you how it
              is likely to be read.
            </p>
            <Link href="/app/new" className="btn-primary mt-7">
              Review a visual
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {recent.map((analysis) => (
              <li key={analysis.id} className="bg-white">
                <AnalysisCard analysis={analysis} />
              </li>
            ))}
            {/* Keeps the hairline grid from showing a bare cell on an odd count. */}
            {recent.length % 2 === 1 && (
              <li className="hidden bg-white sm:block" aria-hidden="true" />
            )}
          </ul>
        )}
      </section>
    </div>
  )
}
