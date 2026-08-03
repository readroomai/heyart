import { ReviewForm } from '@/components/app/review-form'
import { loadWorkspace } from '@/lib/app-data'

export const metadata = { title: 'New Review' }

export default async function NewReviewPage() {
  const { brandProfiles, usage } = await loadWorkspace()
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Visual Review</p>
        <h1 className="mt-4 text-section text-editorial">
          One visual, read the way <em className="italic">an audience reads it.</em>
        </h1>
        <p className="mt-4 text-lede text-ink-soft">
          Upload the work, set the brief, and get an attention path, nine scored dimensions and five
          prioritised changes.
        </p>
      </header>
      <div className="mt-10">
        <ReviewForm
          mode="visual_review"
          brandProfiles={brandProfiles}
          remaining={usage.remaining}
        />
      </div>
    </div>
  )
}
