import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { loadAnalysisDetail } from '@/lib/app-data'
import { ReportView } from '@/components/report/report-view'
import { AnalysisActions } from '@/components/app/analysis-actions'
import { MODE_LABELS, type AnalysisMode } from '@/lib/options'
import { APP_URL } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser()
  const detail = await loadAnalysisDetail(user.id, id)
  return { title: detail?.analysis.title ?? 'Review' }
}

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser()
  const detail = await loadAnalysisDetail(user.id, id)
  if (!detail) notFound()

  const { analysis, previews, shareLink } = detail

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <Link
        href="/app/history"
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        History
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-6 border-b border-line pb-8">
        <div className="min-w-0">
          <p className="eyebrow">
            {MODE_LABELS[analysis.mode as AnalysisMode] ?? analysis.mode} · {analysis.platform}
          </p>
          <h1 className="mt-3 text-[clamp(1.7rem,3.4vw,2.6rem)] text-editorial">
            {analysis.title}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            {analysis.goal} · {analysis.desiredImpression} · for {analysis.targetAudience}
          </p>
        </div>
        <AnalysisActions
          analysisId={analysis.id}
          title={analysis.title}
          isFavourite={analysis.isFavourite}
          shareSlug={shareLink?.isActive ? shareLink.slug : null}
          shareRevealsImages={shareLink?.revealImages ?? false}
          appUrl={APP_URL}
        />
      </header>

      <div className="mt-12">
        <ReportView mode={analysis.mode} report={analysis.result} previews={previews} />
      </div>
    </div>
  )
}
