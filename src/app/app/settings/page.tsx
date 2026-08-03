import Link from 'next/link'
import { loadWorkspace } from '@/lib/app-data'
import { GEMINI_MODEL, isClerkConfigured } from '@/lib/env'
import { BETA_BRAND_PROFILE_LIMIT, BETA_DAILY_ANALYSIS_LIMIT } from '@/lib/options'

export const metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { user, usage, brandProfiles } = await loadWorkspace()

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-4 text-section text-editorial">Your account.</h1>
      </header>

      <section className="mt-10 border border-line">
        <div className="border-b border-line p-6">
          <h2 className="eyebrow">Account</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Name</dt>
              <dd className="text-ink">{user.displayName || 'Not set'}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Email</dt>
              <dd className="text-ink">{user.email || 'Not shared'}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Joined</dt>
              <dd className="text-ink">
                {new Date(user.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
          </dl>
          {isClerkConfigured() && (
            <p className="mt-5 text-sm text-ink-soft">
              Password, email and sign-in methods are managed from the account menu in the sidebar.
            </p>
          )}
        </div>

        <div className="border-b border-line p-6">
          <h2 className="eyebrow">Free beta limits</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Reviews used today</dt>
              <dd className="tnum text-ink">
                {usage.used} of {BETA_DAILY_ANALYSIS_LIMIT}
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Resets</dt>
              <dd className="text-ink">Midnight UTC</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Brand Profiles</dt>
              <dd className="tnum text-ink">
                {brandProfiles.length} of {BETA_BRAND_PROFILE_LIMIT}
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-ink-soft">Vision model</dt>
              <dd className="font-mono text-xs text-ink">{GEMINI_MODEL}</dd>
            </div>
          </dl>
        </div>

        <div className="p-6">
          <h2 className="eyebrow">Your data</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Deleting a review removes its stored images at the same time. To delete your account and
            everything in it, remove your account from the account menu — your reviews, Brand
            Profiles, share links and uploaded files are deleted with it.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link href="/privacy" className="text-sm text-cobalt underline underline-offset-4">
              Privacy policy
            </Link>
            <Link
              href="/ai-limitations"
              className="text-sm text-cobalt underline underline-offset-4"
            >
              AI limitations
            </Link>
            <Link href="/terms" className="text-sm text-cobalt underline underline-offset-4">
              Terms
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
