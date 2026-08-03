import { cn } from '@/lib/cn'
import { scoreBand, type DimensionKey, DIMENSION_LABELS, DIMENSION_HINTS } from '@/lib/options'

/**
 * The headline score. The number, the band word and the arc all say the same
 * thing, so the meaning never depends on colour alone.
 */
export function ScoreDial({
  score,
  label = 'Visual Score',
  size = 'lg',
}: {
  score: number
  label?: string
  size?: 'sm' | 'lg'
}) {
  const radius = size === 'lg' ? 54 : 34
  const stroke = size === 'lg' ? 3 : 2.5
  const circumference = 2 * Math.PI * radius
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference
  const box = (radius + stroke * 2) * 2

  return (
    <figure className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: box, height: box }}>
        <svg viewBox={`0 0 ${box} ${box}`} className="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="rgba(17,17,17,0.10)"
            strokeWidth={stroke}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke="#111111"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-editorial tnum leading-none',
              size === 'lg' ? 'text-[44px]' : 'text-[26px]'
            )}
          >
            {score}
          </span>
        </div>
      </div>
      <figcaption>
        <p className="eyebrow">{label}</p>
        <p className={cn('mt-1.5 text-ink', size === 'lg' ? 'text-lg' : 'text-sm')}>
          {scoreBand(score)}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">out of 100</p>
      </figcaption>
    </figure>
  )
}

/** A single dimension row: label, plain-language band, value and a bar. */
export function DimensionBar({
  dimensionKey,
  score,
  reason,
  compact = false,
}: {
  dimensionKey: DimensionKey | string
  score: number
  reason?: string
  compact?: boolean
}) {
  const label =
    DIMENSION_LABELS[dimensionKey as DimensionKey] ??
    dimensionKey.charAt(0).toUpperCase() + dimensionKey.slice(1)
  const hint = DIMENSION_HINTS[dimensionKey as DimensionKey]

  return (
    <div className={cn('border-t border-line py-4', compact && 'py-3')}>
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="text-sm font-medium text-ink">{label}</h4>
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-ink-soft">{scoreBand(score)}</span>
          <span className="tnum text-sm text-ink">{score}</span>
        </div>
      </div>
      <div
        className="mt-2.5 h-[3px] w-full bg-line"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${score} out of 100, ${scoreBand(score)}`}
      >
        <div className="h-full bg-ink" style={{ width: `${Math.max(2, score)}%` }} />
      </div>
      {reason && !compact && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{reason}</p>}
      {hint && compact && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}

/** Numbered attention-order marker placed over the image preview. */
export function AttentionMarker({
  order,
  className,
  style,
  delayMs = 0,
  animate = false,
}: {
  order: number
  className?: string
  style?: React.CSSProperties
  delayMs?: number
  animate?: boolean
}) {
  return (
    <span
      className={cn(
        'absolute z-20 flex h-7 w-7 items-center justify-center rounded-full border border-ink',
        'bg-ivory text-[11px] font-medium tabular-nums text-ink shadow-frame',
        animate && 'animate-marker-pop',
        className
      )}
      style={{ ...style, animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    >
      {order}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  children,
  className,
}: {
  eyebrow?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-4 text-section text-editorial">{children}</h2>
    </div>
  )
}

export function ListBlock({
  title,
  items,
  tone = 'neutral',
  empty,
}: {
  title: string
  items: string[]
  tone?: 'neutral' | 'positive' | 'critical'
  empty?: string
}) {
  const dot = tone === 'positive' ? 'bg-cobalt' : tone === 'critical' ? 'bg-coral' : 'bg-ink-soft'
  return (
    <section>
      <h3 className="eyebrow">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">{empty ?? 'Nothing flagged here.'}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink">
              <span
                className={cn('mt-[9px] h-1 w-1 shrink-0 rounded-full', dot)}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
