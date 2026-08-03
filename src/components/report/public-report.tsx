'use client'

import { useState } from 'react'
import { ReportView, type ImagePreview } from './report-view'

/**
 * Public wrapper. The image starts hidden even when the owner has allowed it
 * to be shown, so a visitor sees the critique first and opts into the visual.
 */
export function PublicReport({
  mode,
  report,
  previews,
  revealImages,
}: {
  mode: string
  report: unknown
  previews: ImagePreview[]
  revealImages: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const canReveal = revealImages && previews.length > 0

  return (
    <>
      <ReportView
        mode={mode}
        report={report}
        previews={revealed ? previews : []}
        imageHidden={!revealed}
        onReveal={canReveal ? () => setRevealed(true) : undefined}
      />
      {!canReveal && (
        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">
          The original visual was not included in this shared report.
        </p>
      )}
    </>
  )
}
