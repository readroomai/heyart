import { requireUser } from '@/lib/auth'
import { loadBrandProfiles } from '@/lib/app-data'
import { BrandProfileManager } from '@/components/app/brand-profile-manager'

export const metadata = { title: 'Brand Profiles' }
export const dynamic = 'force-dynamic'

export default async function BrandProfilesPage() {
  const user = await requireUser()
  const profiles = await loadBrandProfiles(user.id)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Brand Profiles</p>
        <h1 className="mt-4 text-section text-editorial">
          Teach it your brand <em className="italic">once.</em>
        </h1>
        <p className="mt-4 text-lede text-ink-soft">
          Attach a profile to any review and brand fit is judged against your actual identity rather
          than a generic idea of good design.
        </p>
      </header>

      <div className="mt-10">
        <BrandProfileManager
          profiles={profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            description: profile.description,
            targetAudience: profile.targetAudience,
            personality: profile.personality,
            desiredImpression: profile.desiredImpression,
            primaryPlatform: profile.primaryPlatform,
            primaryColours: profile.primaryColours,
            secondaryColours: profile.secondaryColours,
            positiveWords: profile.positiveWords,
            negativeWords: profile.negativeWords,
            isDefault: profile.isDefault,
          }))}
        />
      </div>
    </div>
  )
}
