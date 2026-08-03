import { ConfigurationNotice } from '@/components/app/configuration-notice'
import { missingConfiguration } from '@/lib/env'

export const metadata = { title: 'Setup required' }
export const dynamic = 'force-dynamic'

export default function SetupPage() {
  const missing = missingConfiguration()
  return (
    <main id="main">
      <ConfigurationNotice missing={missing.length > 0 ? missing : ['Clerk authentication']} />
    </main>
  )
}
