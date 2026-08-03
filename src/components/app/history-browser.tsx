'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Check, Copy, CopyPlus, Pencil, Search, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ANALYSIS_MODES, MODE_LABELS, scoreBand, type AnalysisMode } from '@/lib/options'

export type HistoryItem = {
  id: string
  title: string
  mode: string
  platform: string
  visualType: string
  goal: string
  isFavourite: boolean
  createdAt: string
  score: number | null
  revisionPrompt: string | null
}

export function HistoryBrowser({ analyses }: { analyses: HistoryItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(analyses)
  const [query, setQuery] = useState('')
  const [modeFilter, setModeFilter] = useState<'all' | AnalysisMode | 'favourites'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (modeFilter === 'favourites' && !item.isFavourite) return false
      if (modeFilter !== 'all' && modeFilter !== 'favourites' && item.mode !== modeFilter) {
        return false
      }
      if (needle && !item.title.toLowerCase().includes(needle)) return false
      return true
    })
  }, [items, query, modeFilter])

  async function toggleFavourite(item: HistoryItem) {
    setError(null)
    const next = !item.isFavourite
    setItems((state) =>
      state.map((row) => (row.id === item.id ? { ...row, isFavourite: next } : row))
    )
    const response = await fetch(`/api/analyses/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavourite: next }),
    })
    if (!response.ok) {
      setItems((state) =>
        state.map((row) => (row.id === item.id ? { ...row, isFavourite: !next } : row))
      )
      setError('That change could not be saved.')
    }
  }

  async function rename(item: HistoryItem) {
    const next = window.prompt('Rename this review', item.title)
    if (!next || !next.trim() || next.trim() === item.title) return
    const title = next.trim().slice(0, 120)
    const response = await fetch(`/api/analyses/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (response.ok) {
      setItems((state) => state.map((row) => (row.id === item.id ? { ...row, title } : row)))
    } else {
      setError('That review could not be renamed.')
    }
  }

  async function remove(item: HistoryItem) {
    if (!window.confirm(`Delete “${item.title}” and its images? This cannot be undone.`)) return
    const response = await fetch(`/api/analyses/${item.id}`, { method: 'DELETE' })
    if (response.ok) {
      setItems((state) => state.filter((row) => row.id !== item.id))
    } else {
      setError('That review could not be deleted.')
    }
  }

  /** Reopens the same brief on a fresh upload screen. */
  function duplicateSetup(item: HistoryItem) {
    const route =
      item.mode === 'ab_compare'
        ? '/app/compare'
        : item.mode === 'feed_audit'
          ? '/app/audit'
          : '/app/new'
    router.push(route)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            aria-label="Search reviews by title"
            className="field pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['all', 'All'],
              ...ANALYSIS_MODES.map((mode) => [mode, MODE_LABELS[mode]] as const),
              ['favourites', 'Favourites'],
            ] as [typeof modeFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setModeFilter(value)}
              aria-pressed={modeFilter === value}
              className={cn(
                'rounded-frame px-3 py-2 text-sm transition-colors',
                modeFilter === value ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 border border-dashed border-line-strong px-6 py-16 text-center text-sm text-ink-soft">
          No reviews match that filter.
        </p>
      ) : (
        <ul className="mt-8 border-t border-line">
          {visible.map((item) => (
            <li key={item.id} className="border-b border-line py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                    {MODE_LABELS[item.mode as AnalysisMode] ?? item.mode} · {item.platform}
                  </p>
                  <Link
                    href={`/app/analysis/${item.id}`}
                    className="mt-2 block truncate text-[17px] text-ink hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    {item.goal} ·{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {item.score !== null && (
                    <div className="text-right">
                      <p className="tnum text-editorial text-2xl leading-none">{item.score}</p>
                      <p className="mt-1 text-[11px] text-ink-soft">{scoreBand(item.score)}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleFavourite(item)}
                      aria-pressed={item.isFavourite}
                      aria-label={item.isFavourite ? 'Remove favourite' : 'Mark as favourite'}
                      title={item.isFavourite ? 'Remove favourite' : 'Mark as favourite'}
                      className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Star className={cn('h-4 w-4', item.isFavourite && 'fill-ink text-ink')} />
                    </button>
                    <button
                      type="button"
                      onClick={() => rename(item)}
                      aria-label={`Rename ${item.title}`}
                      title="Rename"
                      className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateSetup(item)}
                      aria-label={`Start a new review using the setup from ${item.title}`}
                      title="Duplicate setup"
                      className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
                    >
                      <CopyPlus className="h-4 w-4" />
                    </button>
                    {item.revisionPrompt && (
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(item.revisionPrompt!)
                          setCopiedId(item.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        aria-label={`Copy the revision prompt from ${item.title}`}
                        title="Copy revision prompt"
                        className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.title}`}
                      title="Delete"
                      className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-coral"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p aria-live="polite" className="sr-only">
        {copiedId ? 'Revision prompt copied to clipboard' : ''}
      </p>
    </div>
  )
}
