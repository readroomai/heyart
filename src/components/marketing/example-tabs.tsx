'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { SAMPLE_COMPARE_REPORT, SAMPLE_FEED_AUDIT, SAMPLE_VISUAL_REPORT } from '@/lib/sample-data'
import { CompareReportView, FeedAuditView, VisualReportView } from '@/components/report/report-view'
import { MODE_LABELS, type AnalysisMode } from '@/lib/options'
import { SampleCreative, SampleFeed } from './sample-creative'

const TABS: AnalysisMode[] = ['visual_review', 'ab_compare', 'feed_audit']

/**
 * The bundled example. Uses pre-generated sample data, so an anonymous
 * visitor never triggers an AI request.
 */
export function ExampleTabs() {
  const [tab, setTab] = useState<AnalysisMode>('visual_review')

  return (
    <div>
      <div
        role="tablist"
        aria-label="Example reports"
        className="flex flex-wrap gap-1 border-b border-line pb-4"
      >
        {TABS.map((mode) => (
          <button
            key={mode}
            role="tab"
            type="button"
            aria-selected={tab === mode}
            onClick={() => setTab(mode)}
            className={cn(
              'rounded-frame px-4 py-2.5 text-sm transition-colors',
              tab === mode ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink'
            )}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <div className="mt-12">
        {tab === 'visual_review' && (
          <VisualReportView
            report={SAMPLE_VISUAL_REPORT}
            previewSlot={
              <div className="aspect-[4/5]">
                <SampleCreative />
              </div>
            }
            isSample
          />
        )}
        {tab === 'ab_compare' && (
          <CompareReportView
            report={SAMPLE_COMPARE_REPORT}
            previewSlots={[<SampleCreative key="a" />, <SampleCreative key="b" variant="b" />]}
            isSample
          />
        )}
        {tab === 'feed_audit' && (
          <FeedAuditView
            report={SAMPLE_FEED_AUDIT}
            previewSlot={
              <div className="aspect-[4/3]">
                <SampleFeed />
              </div>
            }
            isSample
          />
        )}
      </div>
    </div>
  )
}
