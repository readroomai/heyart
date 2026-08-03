import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app/sidebar'
import { getIdentity, upsertUser } from '@/lib/auth'
import { getDailyUsage } from '@/lib/usage'
import { isClerkConfigured, isDatabaseConfigured, isPreviewAuthEnabled } from '@/lib/env'
import { ConfigurationNotice } from '@/components/app/configuration-notice'

export const dynamic = 'force-dynamic'

async function UserSlot() {
  if (!isClerkConfigured()) {
    return <span className="text-xs text-ink-soft">Preview</span>
  }
  const { UserButton } = await import('@clerk/nextjs')
  return <UserButton afterSignOutUrl="/" />
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const identity = await getIdentity()
  if (!identity) redirect('/sign-in')

  if (!isDatabaseConfigured() && !isPreviewAuthEnabled()) {
    return (
      <div className="min-h-dvh">
        <ConfigurationNotice missing={['Supabase database']} />
      </div>
    )
  }

  // Lazy upsert: the row is created the first time a signed-in user opens the
  // app, so no webhook is required for the MVP.
  const user = await upsertUser(identity)
  const usage = await getDailyUsage(user.id)

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar used={usage.used} userSlot={<UserSlot />} />
      <main id="main" className="min-w-0 flex-1 bg-white">
        {children}
      </main>
    </div>
  )
}
