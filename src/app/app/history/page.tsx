import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { loadAllAnalyses } from '@/lib/app-data'
import { HistoryBrowser } from '@/components/app/history-browser'

export const metadata = { title: 'History' }
export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const user = await requireUser()
  const analyses = await loadAllAnalyses(user.id)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <header>
        <p className="eyebrow">History</p>
        <h1 className="mt-4 text-section text-editorial">Everything you have reviewed.</h1>
      </header>

      {analyses.length === 0 ? (
        <div className="mt-12 border border-dashed border-line-strong px-6 py-20 text-center">
          <p className="text-lg text-editorial">No reviews yet.</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
            Once you review a visual it will appear here, with everything you need to reopen,
            rename, favourite or share it.
          </p>
          <Link href="/app/new" className="btn-primary mt-7">
            Review a visual
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <HistoryBrowser
            analyses={analyses.map((analysis) => ({
              id: analysis.id,
              title: analysis.title,
              mode: analysis.mode,
              platform: analysis.platform,
              visualType: analysis.visualType,
              goal: analysis.goal,
              isFavourite: analysis.isFavourite,
              createdAt: analysis.createdAt.toISOString(),
              score:
                analysis.result &&
                typeof (analysis.result as { visualScore?: number }).visualScore === 'number'
                  ? (analysis.result as { visualScore: number }).visualScore
                  : null,
              revisionPrompt:
                analysis.result &&
                typeof (analysis.result as { creativeRevisionPrompt?: string })
                  .creativeRevisionPrompt === 'string'
                  ? (analysis.result as { creativeRevisionPrompt: string }).creativeRevisionPrompt
                  : null,
            }))}
          />
        </div>
      )}
    </div>
  )
}
