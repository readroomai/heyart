'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { DIMENSION_KEYS, scoreBand, type DimensionKey } from '@/lib/options'
import type { CompareReport, FeedAuditReport, VisualReport } from '@/lib/schemas'
import { CopyButton } from '@/components/copy-button'
import { AttentionMarker, DimensionBar, ListBlock, ScoreDial } from './primitives'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'attention', label: 'Attention path' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'audience', label: 'Audience reads' },
  { id: 'strengths', label: 'What works' },
  { id: 'weaknesses', label: 'What weakens it' },
  { id: 'improvements', label: 'Improvements' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'brief', label: 'Revision brief' },
]

/** Sticky section navigation, desktop only. */
function SectionNav({ ids }: { ids: typeof SECTIONS }) {
  const [active, setActive] = useState(ids[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-96px 0px -60% 0px' }
    )
    ids.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [ids])

  return (
    <nav aria-label="Report sections" className="hidden lg:block">
      <ul className="sticky top-28 space-y-1 border-l border-line">
        {ids.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                '-ml-px block border-l py-1.5 pl-4 text-sm transition-colors',
                active === section.id
                  ? 'border-ink text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink'
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export type ImagePreview = { url: string; label: string }

function ImagePlate({
  preview,
  previewSlot,
  attentionPath,
  hidden,
  onReveal,
}: {
  preview?: ImagePreview
  previewSlot?: React.ReactNode
  attentionPath?: VisualReport['attentionPath']
  hidden?: boolean
  onReveal?: () => void
}) {
  if (hidden) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 border border-dashed border-line-strong bg-white/50 p-8 text-center">
        <p className="text-sm text-ink-soft">
          The original visual is hidden on this shared report.
        </p>
        {onReveal && (
          <button type="button" onClick={onReveal} className="btn-secondary">
            Reveal the image
          </button>
        )}
      </div>
    )
  }

  if (!preview && !previewSlot) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center border border-line bg-white/50">
        <p className="text-sm text-ink-soft">Image preview unavailable.</p>
      </div>
    )
  }

  // Markers sit on a fixed diagonal: the exact coordinates are not something
  // the model returns, so they read as an ordered annotation, not a heatmap.
  const positions = [
    { top: '30%', left: '50%' },
    { top: '56%', left: '28%' },
    { top: '78%', left: '66%' },
  ]

  return (
    <figure className="relative">
      <div className="relative overflow-hidden border border-line bg-white">
        {previewSlot ?? <img src={preview!.url} alt={preview!.label} className="block w-full" />}
        {attentionPath?.slice(0, 3).map((step, index) => (
          <AttentionMarker
            key={step.order}
            order={step.order}
            animate
            delayMs={index * 220}
            style={{
              ...positions[index],
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-ink-soft">
        {preview?.label ?? 'Sample visual'}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Visual Review                                                       */
/* ------------------------------------------------------------------ */

export function VisualReportView({
  report,
  preview,
  previewSlot,
  imageHidden,
  onReveal,
  isSample = false,
}: {
  report: VisualReport
  preview?: ImagePreview
  previewSlot?: React.ReactNode
  imageHidden?: boolean
  onReveal?: () => void
  isSample?: boolean
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_200px] lg:gap-16">
      <div className="min-w-0 space-y-14">
        <section id="overview" className="scroll-offset">
          {isSample && (
            <p className="mb-6 inline-block bg-sunlight px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
              Sample report · pre-generated
            </p>
          )}
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-10">
            <ImagePlate
              preview={preview}
              previewSlot={previewSlot}
              attentionPath={report.attentionPath}
              hidden={imageHidden}
              onReveal={onReveal}
            />
            <div>
              <ScoreDial score={report.visualScore} />
              <p className="mt-8 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-editorial">
                {report.firstImpression}
              </p>
              <dl className="mt-8 space-y-5 border-t border-line pt-6">
                <div>
                  <dt className="eyebrow">What it appears to communicate</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">{report.primaryMessage}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Likely emotional response</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">
                    {report.likelyEmotionalResponse}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Alignment with your intent</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">
                    {report.intendedMessageAlignment}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="attention" className="scroll-offset">
          <h2 className="eyebrow">Attention path</h2>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            The order the eye is likely to move in. That sequence is the argument the visual makes.
          </p>
          <ol className="mt-7 border-t border-line">
            {report.attentionPath.map((step) => (
              <li key={step.order} className="flex gap-5 border-b border-line py-5">
                <span className="marker mt-0.5">{step.order}</span>
                <div>
                  <p className="text-[15px] font-medium text-ink">{step.element}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="dimensions" className="scroll-offset">
          <h2 className="eyebrow">Dimension scores</h2>
          <div className="mt-6 grid gap-x-12 md:grid-cols-2">
            {DIMENSION_KEYS.map((key: DimensionKey) => (
              <DimensionBar
                key={key}
                dimensionKey={key}
                score={report.dimensions[key].score}
                reason={report.dimensions[key].reason}
              />
            ))}
          </div>
        </section>

        <section id="audience" className="scroll-offset">
          <h2 className="eyebrow">Audience reads</h2>
          <p className="mt-3 max-w-prose text-sm text-ink-soft">
            The same frame produces different conclusions depending on who is looking.
          </p>
          <div className="mt-7 grid gap-px border border-line bg-line md:grid-cols-2">
            {report.audienceReads.map((read) => (
              <div key={read.audience} className="bg-white p-6">
                <h3 className="text-sm font-medium text-ink">{read.audience}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{read.interpretation}</p>
                <div className="mt-5 space-y-3 border-t border-line pt-4">
                  <p className="flex gap-3 text-sm text-ink">
                    <span
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cobalt"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="sr-only">Positive signal: </span>
                      {read.positiveSignal}
                    </span>
                  </p>
                  <p className="flex gap-3 text-sm text-ink">
                    <span
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-coral"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="sr-only">Concern: </span>
                      {read.concern}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="strengths" className="scroll-offset">
          <ListBlock title="What works" items={report.whatWorks} tone="positive" />
        </section>

        <section id="weaknesses" className="scroll-offset space-y-10">
          <ListBlock title="What weakens the visual" items={report.whatWeakensIt} tone="critical" />
          <ListBlock
            title="Possible misunderstandings"
            items={report.misunderstandingRisks}
            empty="No obvious misreadings were flagged."
          />
        </section>

        <section id="improvements" className="scroll-offset">
          <h2 className="eyebrow">Priority improvements</h2>
          <ol className="mt-6 border-t border-line">
            {report.priorityImprovements.map((item) => (
              <li key={item.priority} className="border-b border-line py-7">
                <div className="flex gap-5">
                  <span className="marker mt-0.5 border-coral text-coral">{item.priority}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] leading-snug text-ink">{item.change}</h3>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                      {[
                        ['Why', item.why],
                        ['How', item.how],
                        ['Expected effect', item.expectedEffect],
                      ].map(([term, detail]) => (
                        <div key={term}>
                          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                            {term}
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{detail}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <ListBlock title="Leave these alone" items={report.preserve} />
          </div>
        </section>

        <section id="accessibility" className="scroll-offset space-y-10">
          <ListBlock
            title="Accessibility concerns"
            items={report.accessibilityConcerns}
            tone="critical"
            empty="No accessibility issues were flagged."
          />
          <ListBlock
            title="Platform observations"
            items={report.platformNotes}
            empty="No platform-specific notes."
          />
        </section>

        <section id="brief" className="scroll-offset space-y-8">
          <div className="border border-line bg-white p-7">
            <h2 className="eyebrow">Revision brief</h2>
            <p className="mt-4 max-w-prose text-lede leading-relaxed text-ink">
              {report.revisionBrief}
            </p>
          </div>

          <div className="border border-line bg-ink p-7 text-ivory">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-mono text-label uppercase tracking-[0.16em] text-ivory/50">
                  Creative revision prompt
                </h2>
                <p className="mt-2 text-sm text-ivory/60">
                  Hand this to a designer, or paste it into your image tool.
                </p>
              </div>
              <CopyButton
                value={report.creativeRevisionPrompt}
                className="border-line-invert text-ivory hover:bg-ivory hover:text-ink"
              />
            </div>
            <p className="mt-6 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ivory/85">
              {report.creativeRevisionPrompt}
            </p>
          </div>

          <ModelNotes assumptions={report.assumptions} confidence={report.confidence} />
        </section>
      </div>

      <SectionNav ids={SECTIONS} />
    </div>
  )
}

export function ModelNotes({
  assumptions,
  confidence,
}: {
  assumptions: string[]
  confidence: number
}) {
  const percentage = Math.round(confidence * 100)
  const wording = percentage >= 75 ? 'High' : percentage >= 50 ? 'Moderate' : 'Low'
  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-[1.6fr_1fr]">
      <div className="bg-ivory p-6">
        <h2 className="eyebrow">What the model assumed</h2>
        {assumptions.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">No assumptions were recorded.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {assumptions.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span
                  className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-soft"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-ivory p-6">
        <h2 className="eyebrow">Model confidence</h2>
        <p className="tnum mt-4 text-3xl text-editorial">{wording}</p>
        <p className="mt-1 text-sm text-ink-soft">{percentage} out of 100</p>
        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          An AI-assisted assessment of how this visual may be perceived — not a prediction of how
          any audience will behave.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* A/B Compare                                                         */
/* ------------------------------------------------------------------ */

export function CompareReportView({
  report,
  previews,
  previewSlots,
  imageHidden,
  onReveal,
  isSample = false,
}: {
  report: CompareReport
  previews?: [ImagePreview?, ImagePreview?]
  previewSlots?: [React.ReactNode?, React.ReactNode?]
  imageHidden?: boolean
  onReveal?: () => void
  isSample?: boolean
}) {
  const [detail, setDetail] = useState<'A' | 'B'>(report.recommendedVariant === 'B' ? 'B' : 'A')
  const detailReport = detail === 'A' ? report.variantA : report.variantB

  return (
    <div className="space-y-14">
      {isSample && (
        <p className="inline-block bg-sunlight px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
          Sample report · pre-generated
        </p>
      )}

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr_0.9fr]">
        {(['A', 'B'] as const).map((key, index) => {
          const variant = key === 'A' ? report.variantA : report.variantB
          const isWinner = report.recommendedVariant === key
          return (
            <figure key={key} className={cn('plate', isWinner && 'ring-1 ring-ink')}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  Variant {key}
                </span>
                {isWinner && (
                  <span className="bg-sunlight px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                    Recommended
                  </span>
                )}
              </div>
              {imageHidden ? (
                <div className="flex aspect-[4/5] items-center justify-center border-b border-line bg-white/50 p-6 text-center">
                  <p className="text-sm text-ink-soft">Image hidden on this shared report.</p>
                </div>
              ) : previewSlots?.[index] ? (
                <div className="aspect-[4/5] border-b border-line">{previewSlots[index]}</div>
              ) : previews?.[index] ? (
                <img
                  src={previews[index]!.url}
                  alt={previews[index]!.label}
                  className="block w-full border-b border-line"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center border-b border-line bg-white/50">
                  <p className="text-sm text-ink-soft">Preview unavailable.</p>
                </div>
              )}
              <figcaption className="flex items-baseline justify-between gap-4 p-4">
                <span className="text-sm text-ink-soft">{variant.title}</span>
                <span className="tnum text-editorial text-3xl">{variant.visualScore}</span>
              </figcaption>
            </figure>
          )
        })}

        <div className="plate flex flex-col">
          <div className="border-b border-line p-5">
            <p className="eyebrow">Recommendation</p>
            <p className="mt-3 text-2xl text-editorial">
              {report.recommendedVariant === 'Neither is clearly stronger'
                ? 'Too close to call'
                : `Variant ${report.recommendedVariant}`}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{report.verdict}</p>
          </div>
          <div className="p-5">
            <p className="eyebrow">The trade-off</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{report.majorTradeOff}</p>
          </div>
        </div>
      </section>

      {onReveal && imageHidden && (
        <button type="button" onClick={onReveal} className="btn-secondary">
          Reveal the images
        </button>
      )}

      <section>
        <h2 className="eyebrow">Judged criterion by criterion</h2>
        <div className="mt-6 border-t border-line">
          {report.criteria.map((row) => (
            <div
              key={row.criterion}
              className="grid gap-2 border-b border-line py-5 sm:grid-cols-[1fr_auto_1.4fr] sm:items-baseline sm:gap-6"
            >
              <h3 className="text-[15px] text-ink">{row.criterion}</h3>
              <span
                className={cn(
                  'justify-self-start border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em]',
                  row.winner === 'Tie' ? 'border-line-strong text-ink-soft' : 'border-ink text-ink'
                )}
              >
                {row.winner === 'Tie' ? 'Tie' : `Variant ${row.winner}`}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{row.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-px border border-line bg-line md:grid-cols-2">
        <div className="bg-white p-7">
          <ListBlock title="Strongest from A" items={report.strongestFromA} tone="positive" />
        </div>
        <div className="bg-white p-7">
          <ListBlock title="Strongest from B" items={report.strongestFromB} tone="positive" />
        </div>
      </section>

      <section className="border border-line bg-white p-7">
        <h2 className="eyebrow">Recommended combined direction</h2>
        <p className="mt-4 max-w-prose text-lede leading-relaxed text-ink">
          {report.combinedDirection}
        </p>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <h2 className="eyebrow">Full review of one variant</h2>
          <div className="flex gap-1" role="tablist" aria-label="Choose a variant to inspect">
            {(['A', 'B'] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={detail === key}
                onClick={() => setDetail(key)}
                className={cn(
                  'rounded-frame px-4 py-2 text-sm transition-colors',
                  detail === key ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink'
                )}
              >
                Variant {key}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <VisualReportView
            report={detailReport}
            preview={previews?.[detail === 'A' ? 0 : 1]}
            previewSlot={previewSlots?.[detail === 'A' ? 0 : 1]}
            imageHidden={imageHidden}
          />
        </div>
      </section>

      <ModelNotes assumptions={report.assumptions} confidence={report.confidence} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Feed Audit                                                          */
/* ------------------------------------------------------------------ */

export function FeedAuditView({
  report,
  preview,
  previewSlot,
  imageHidden,
  onReveal,
  isSample = false,
}: {
  report: FeedAuditReport
  preview?: ImagePreview
  previewSlot?: React.ReactNode
  imageHidden?: boolean
  onReveal?: () => void
  isSample?: boolean
}) {
  return (
    <div className="space-y-14">
      {isSample && (
        <p className="inline-block bg-sunlight px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
          Sample report · pre-generated
        </p>
      )}

      <section className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
        <ImagePlate
          preview={preview}
          previewSlot={previewSlot}
          hidden={imageHidden}
          onReveal={onReveal}
        />
        <div>
          <ScoreDial score={report.visualScore} label="Feed score" />
          <p className="mt-8 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug text-editorial">
            {report.immediatePositioning}
          </p>
          <dl className="mt-8 border-t border-line pt-6">
            <dt className="eyebrow">Appears to be about</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink">{report.appearsToBeAbout}</dd>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="eyebrow">What stays unclear</h2>
        <ul className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
          {report.remainsUnclear.map((item) => (
            <li key={item} className="bg-white p-5 text-sm leading-relaxed text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="eyebrow">Dimension scores</h2>
        <div className="mt-6 grid gap-x-12 md:grid-cols-2">
          {(['consistency', 'recognition', 'variety', 'professionalism', 'trust'] as const).map(
            (key) => (
              <DimensionBar
                key={key}
                dimensionKey={key}
                score={report.dimensions[key].score}
                reason={report.dimensions[key].reason}
              />
            )
          )}
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-3">
        <ListBlock title="Repetition" items={report.repetition} empty="No heavy repetition." />
        <ListBlock
          title="Conflicting styles"
          items={report.conflictingStyles}
          tone="critical"
          empty="No style conflicts flagged."
        />
        <ListBlock
          title="Trust signals"
          items={report.trustSignals}
          empty="No trust signals flagged."
        />
      </section>

      <section>
        <h2 className="eyebrow">Three visual directions</h2>
        <div className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
          {report.directions.map((direction, index) => (
            <div key={direction.name} className="bg-white p-7">
              <span className="tnum font-mono text-[11px] tracking-[0.16em] text-coral">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-xl text-editorial">{direction.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{direction.description}</p>
              <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ink-soft">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  Trade-off ·{' '}
                </span>
                {direction.tradeOff}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="eyebrow">Before you post again</h2>
        <ol className="mt-6 border-t border-line">
          {report.checklist.map((item, index) => (
            <li key={item} className="flex gap-5 border-b border-line py-4">
              <span className="marker mt-0.5">{index + 1}</span>
              <span className="text-sm leading-relaxed text-ink">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-8">
        <div className="border border-line bg-white p-7">
          <h2 className="eyebrow">Revision brief</h2>
          <p className="mt-4 max-w-prose text-lede leading-relaxed text-ink">
            {report.revisionBrief}
          </p>
        </div>
        <div className="border border-line bg-ink p-7 text-ivory">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="font-mono text-label uppercase tracking-[0.16em] text-ivory/50">
              Creative revision prompt
            </h2>
            <CopyButton
              value={report.creativeRevisionPrompt}
              className="border-line-invert text-ivory hover:bg-ivory hover:text-ink"
            />
          </div>
          <p className="mt-6 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ivory/85">
            {report.creativeRevisionPrompt}
          </p>
        </div>
        <ModelNotes assumptions={report.assumptions} confidence={report.confidence} />
      </section>
    </div>
  )
}

/** Chooses the right view for a stored report. */
export function ReportView({
  mode,
  report,
  previews,
  imageHidden,
  onReveal,
  isSample,
}: {
  mode: string
  report: unknown
  previews?: ImagePreview[]
  imageHidden?: boolean
  onReveal?: () => void
  isSample?: boolean
}) {
  if (mode === 'ab_compare') {
    return (
      <CompareReportView
        report={report as CompareReport}
        previews={[previews?.[0], previews?.[1]]}
        imageHidden={imageHidden}
        onReveal={onReveal}
        isSample={isSample}
      />
    )
  }
  if (mode === 'feed_audit') {
    return (
      <FeedAuditView
        report={report as FeedAuditReport}
        preview={previews?.[0]}
        imageHidden={imageHidden}
        onReveal={onReveal}
        isSample={isSample}
      />
    )
  }
  return (
    <VisualReportView
      report={report as VisualReport}
      preview={previews?.[0]}
      imageHidden={imageHidden}
      onReveal={onReveal}
      isSample={isSample}
    />
  )
}

export { scoreBand }
