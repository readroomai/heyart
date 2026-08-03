'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Stages describe what is actually happening, in order. No percentage is
 * shown, because the real progress of a single model call is unknown.
 */
const STAGES = [
  'Reading the composition',
  'Checking visual hierarchy',
  'Comparing the intended audience',
  'Preparing recommendations',
]

export function AnalysisLoading({ previewUrls }: { previewUrls: string[] }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((current) => Math.min(current + 1, STAGES.length - 1))
    }, 4200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mx-auto max-w-3xl py-10">
      <p
        aria-live="polite"
        role="status"
        className="text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft"
      >
        {STAGES[stage]}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative overflow-hidden border border-line bg-ivory">
            <img
              src={url}
              alt=""
              className="block max-h-[380px] w-full object-contain opacity-90"
            />
            {/* Scanning sweep across the visual being read. */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <div className="animate-sweep h-1/3 w-full bg-gradient-to-b from-transparent via-white/55 to-transparent" />
            </div>
            {/* Markers appear as each stage completes. */}
            {[0, 1, 2].map((marker) =>
              stage > marker ? (
                <span
                  key={marker}
                  className="animate-marker-pop absolute z-20 flex h-7 w-7 items-center justify-center
                    rounded-full border border-ink bg-ivory text-[11px] tabular-nums text-ink"
                  style={{
                    top: `${28 + marker * 24}%`,
                    left: `${34 + (marker % 2) * 26}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-hidden="true"
                >
                  {marker + 1}
                </span>
              ) : null
            )}
            {previewUrls.length > 1 && (
              <span className="absolute left-2 top-2 bg-ivory/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                Variant {index === 0 ? 'A' : 'B'}
              </span>
            )}
          </div>
        ))}
      </div>

      <ol className="mt-10 border-t border-line">
        {STAGES.map((item, index) => (
          <li
            key={item}
            className={cn(
              'flex items-center gap-4 border-b border-line py-3.5 text-sm transition-colors',
              index <= stage ? 'text-ink' : 'text-ink-soft/50'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                index < stage ? 'bg-ink' : index === stage ? 'bg-coral' : 'bg-line-strong'
              )}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-xs text-ink-soft">
        This usually takes under a minute. Keep this tab open.
      </p>
    </div>
  )
}
