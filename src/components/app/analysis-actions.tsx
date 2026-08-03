'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Link2, Loader2, Pencil, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function AnalysisActions({
  analysisId,
  title,
  isFavourite,
  shareSlug,
  shareRevealsImages,
  appUrl,
}: {
  analysisId: string
  title: string
  isFavourite: boolean
  shareSlug: string | null
  shareRevealsImages: boolean
  appUrl: string
}) {
  const router = useRouter()
  const [favourite, setFavourite] = useState(isFavourite)
  const [slug, setSlug] = useState(shareSlug)
  const [reveal, setReveal] = useState(shareRevealsImages)
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareUrl = slug ? `${appUrl}/r/${slug}` : null

  async function patch(body: Record<string, unknown>) {
    const response = await fetch(`/api/analyses/${analysisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'That change could not be saved.')
    }
  }

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key)
    setError(null)
    try {
      await action()
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : 'Something went wrong.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="w-full lg:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            run('fav', async () => {
              await patch({ isFavourite: !favourite })
              setFavourite(!favourite)
              router.refresh()
            })
          }
          aria-pressed={favourite}
          className="btn-secondary"
        >
          <Star className={cn('h-4 w-4', favourite && 'fill-ink')} />
          {favourite ? 'Favourite' : 'Add favourite'}
        </button>

        <button
          type="button"
          onClick={() =>
            run('rename', async () => {
              const next = window.prompt('Rename this review', title)
              if (!next || next.trim() === title) return
              await patch({ title: next.trim().slice(0, 120) })
              router.refresh()
            })
          }
          className="btn-secondary"
        >
          <Pencil className="h-4 w-4" />
          Rename
        </button>

        <button
          type="button"
          onClick={() =>
            run('share', async () => {
              if (slug) {
                const response = await fetch(`/api/share?analysisId=${analysisId}`, {
                  method: 'DELETE',
                })
                if (!response.ok) throw new Error('The link could not be revoked.')
                setSlug(null)
                return
              }
              const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId, revealImages: reveal }),
              })
              const data = await response.json()
              if (!response.ok) throw new Error(data.error || 'The link could not be created.')
              setSlug(data.shareLink.slug)
            })
          }
          className="btn-secondary"
        >
          {busy === 'share' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {slug ? 'Revoke link' : 'Create share link'}
        </button>

        <button
          type="button"
          onClick={() =>
            run('delete', async () => {
              if (!window.confirm('Delete this review and its images? This cannot be undone.')) {
                return
              }
              const response = await fetch(`/api/analyses/${analysisId}`, { method: 'DELETE' })
              if (!response.ok) throw new Error('The review could not be deleted.')
              router.push('/app/history')
              router.refresh()
            })
          }
          className="btn-ghost"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {shareUrl && (
        <div className="mt-4 border border-line bg-ivory p-4">
          <p className="eyebrow">Public link</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-frame bg-white px-3 py-2 font-mono text-xs text-ink">
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="btn-secondary"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={reveal}
              onChange={(event) =>
                run('reveal', async () => {
                  const next = event.target.checked
                  const response = await fetch('/api/share', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ analysisId, revealImages: next }),
                  })
                  if (!response.ok) throw new Error('That setting could not be saved.')
                  setReveal(next)
                })
              }
              className="h-4 w-4 accent-ink"
            />
            Show the original image on the public page
          </label>
          <p className="mt-2 text-xs text-ink-soft">
            Your email, private context and file paths are never shown on a shared report.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-coral">
          {error}
        </p>
      )}
    </div>
  )
}
