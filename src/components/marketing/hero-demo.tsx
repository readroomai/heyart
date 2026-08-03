import { SampleCreative } from './sample-creative'
import { AttentionMarker } from '@/components/report/primitives'
import { SAMPLE_VISUAL_REPORT } from '@/lib/sample-data'
import { scoreBand } from '@/lib/options'

// Placed just outside each element rather than on top of it, so the markers
// annotate the creative the way a critique note would.
const MARKERS = [
  { order: 1, top: '54%', left: '77%' },
  { order: 2, top: '19%', left: '4%' },
  { order: 3, top: '92%', left: '4%' },
]

/**
 * The hero composition. A static, pre-generated sample — no AI request is made
 * for anonymous visitors.
 */
export function HeroDemo() {
  const report = SAMPLE_VISUAL_REPORT
  const top = report.priorityImprovements[0]

  return (
    <div className="plate shadow-lift">
      {/* Gallery label bar */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            Visual Review · Sample
          </p>
        </div>
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft sm:block">
          Instagram · Premium · Launch a product
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* Image side */}
        <div className="border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[360px] overflow-hidden border border-line">
            <SampleCreative />
            {MARKERS.map((marker, index) => (
              <AttentionMarker
                key={marker.order}
                order={marker.order}
                animate
                delayMs={400 + index * 260}
                style={{ top: marker.top, left: marker.left, transform: 'translate(-50%, -50%)' }}
              />
            ))}
            <span className="absolute right-2 top-2 z-20 bg-ivory/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              Sample visual
            </span>
          </div>

          <ol className="mx-auto mt-5 max-w-[360px] space-y-2.5">
            {report.attentionPath.map((step) => (
              <li key={step.order} className="flex items-start gap-3">
                <span className="marker mt-px">{step.order}</span>
                <span className="text-sm leading-relaxed text-ink">{step.element}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Report side */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-6 border-b border-line p-5 sm:p-6">
            <div>
              <p className="eyebrow">First impression</p>
              <p className="mt-3 max-w-sm text-[17px] leading-snug text-editorial">
                {report.firstImpression}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tnum text-editorial text-[52px] leading-none">{report.visualScore}</p>
              <p className="mt-1 text-xs text-ink-soft">{scoreBand(report.visualScore)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-b border-line">
            {(['clarity', 'trust', 'platformFit'] as const).map((key) => (
              <div key={key} className="border-r border-line p-4 last:border-r-0 sm:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  {key === 'platformFit' ? 'Platform' : key}
                </p>
                <p className="tnum mt-2 text-2xl text-ink">{report.dimensions[key].score}</p>
                <div className="mt-2 h-[2px] w-full bg-line">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${report.dimensions[key].score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-line p-5 sm:p-6">
            <p className="eyebrow">Priority improvement 01</p>
            <p className="mt-3 text-[15px] font-medium text-ink">{top?.change}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{top?.why}</p>
          </div>

          <div className="flex-1 bg-white/60 p-5 sm:p-6">
            <p className="eyebrow">Revision prompt</p>
            <p className="mt-3 line-clamp-4 font-mono text-[12px] leading-relaxed text-ink-soft">
              {report.creativeRevisionPrompt}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 border border-line-strong px-3 py-1.5">
              <span className="h-1 w-1 rounded-full bg-cobalt" aria-hidden="true" />
              <span className="text-xs text-ink">Ready to paste</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
