import Link from 'next/link'
import { Star } from 'lucide-react'
import type { AnalysisRow } from '@/lib/db/schema'
import { MODE_LABELS, scoreBand, type AnalysisMode } from '@/lib/options'

function scoreOf(analysis: AnalysisRow): number | null {
  const result = analysis.result as Record<string, unknown> | null
  if (!result) return null
  const value = result.visualScore
  return typeof value === 'number' ? value : null
}

export function AnalysisCard({ analysis }: { analysis: AnalysisRow }) {
  const score = scoreOf(analysis)
  return (
    <Link
      href={`/app/analysis/${analysis.id}`}
      className="block p-5 transition-colors hover:bg-ivory"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            {MODE_LABELS[analysis.mode as AnalysisMode] ?? analysis.mode}
          </p>
          <h3 className="mt-2 truncate text-[15px] text-ink">{analysis.title}</h3>
          <p className="mt-1.5 text-xs text-ink-soft">
            {analysis.platform} ·{' '}
            {new Date(analysis.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {analysis.isFavourite && (
            <Star className="ml-auto mb-1 h-3.5 w-3.5 fill-ink text-ink" aria-label="Favourite" />
          )}
          {score !== null ? (
            <>
              <p className="tnum text-editorial text-3xl leading-none">{score}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{scoreBand(score)}</p>
            </>
          ) : (
            <p className="text-xs text-ink-soft">{analysis.mode === 'ab_compare' ? 'A/B' : '—'}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
