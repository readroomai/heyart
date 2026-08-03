import { ReviewForm } from '@/components/app/review-form'
import { loadWorkspace } from '@/lib/app-data'

export const metadata = { title: 'Feed Audit' }

export default async function AuditPage() {
  const { brandProfiles, usage } = await loadWorkspace()
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Feed Audit</p>
        <h1 className="mt-4 text-section text-editorial">
          Your profile is one image, <em className="italic">not nine.</em>
        </h1>
        <p className="mt-4 text-lede text-ink-soft">
          Upload a screenshot of your profile, feed, gallery or portfolio. HiArt reads it as a
          single body of work. It never connects to a social platform.
        </p>
      </header>
      <div className="mt-10">
        <ReviewForm mode="feed_audit" brandProfiles={brandProfiles} remaining={usage.remaining} />
      </div>
    </div>
  )
}
