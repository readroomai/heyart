import { ReviewForm } from '@/components/app/review-form'
import { loadWorkspace } from '@/lib/app-data'

export const metadata = { title: 'A/B Compare' }

export default async function ComparePage() {
  const { brandProfiles, usage } = await loadWorkspace()
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">A/B Compare</p>
        <h1 className="mt-4 text-section text-editorial">
          Two variants. <em className="italic">One clear recommendation.</em>
        </h1>
        <p className="mt-4 text-lede text-ink-soft">
          Upload both versions. HiArt judges them against the goal you set, and names what you give
          up by choosing the winner.
        </p>
      </header>
      <div className="mt-10">
        <ReviewForm mode="ab_compare" brandProfiles={brandProfiles} remaining={usage.remaining} />
      </div>
    </div>
  )
}
