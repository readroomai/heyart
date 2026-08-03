'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { UploadZone, type LocalImage } from './upload-zone'
import { AnalysisLoading } from './analysis-loading'
import {
  AUDIENCES,
  FAMILIARITY_LEVELS,
  GOALS,
  IMPRESSIONS,
  KNOWLEDGE_LEVELS,
  MODE_LABELS,
  PLATFORMS,
  SENTIMENT_LEVELS,
  VISUAL_TYPES,
  type AnalysisMode,
} from '@/lib/options'
import type { BrandProfileRow } from '@/lib/db/schema'

const CUSTOM = 'Custom'

type Props = {
  mode: AnalysisMode
  brandProfiles: Pick<BrandProfileRow, 'id' | 'name' | 'isDefault'>[]
  remaining: number
}

export function ReviewForm({ mode, brandProfiles, remaining }: Props) {
  const router = useRouter()
  const isCompare = mode === 'ab_compare'
  const isAudit = mode === 'feed_audit'

  const [primary, setPrimary] = useState<LocalImage | null>(null)
  const [secondary, setSecondary] = useState<LocalImage | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const defaultProfile = brandProfiles.find((profile) => profile.isDefault)

  const [visualType, setVisualType] = useState<string>(
    isAudit ? 'Profile screenshot' : VISUAL_TYPES[0]
  )
  const [platform, setPlatform] = useState<string>(PLATFORMS[0])
  const [audience, setAudience] = useState<string>(AUDIENCES[1])
  const [goal, setGoal] = useState<string>(GOALS[0])
  const [customGoal, setCustomGoal] = useState('')
  const [impression, setImpression] = useState<string>(IMPRESSIONS[0])
  const [customImpression, setCustomImpression] = useState('')
  const [context, setContext] = useState('')
  const [brandProfileId, setBrandProfileId] = useState<string>(defaultProfile?.id ?? '')

  const [customAudience, setCustomAudience] = useState({
    name: '',
    familiarity: FAMILIARITY_LEVELS[0] as string,
    knowledge: KNOWLEDGE_LEVELS[0] as string,
    sentiment: SENTIMENT_LEVELS[1] as string,
    cares: '',
    desiredReaction: '',
  })

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const outOfReviews = remaining <= 0

  const ready = useMemo(() => {
    if (!primary) return false
    if (isCompare && !secondary) return false
    if (goal === CUSTOM && !customGoal.trim()) return false
    if (impression === CUSTOM && !customImpression.trim()) return false
    if (audience === CUSTOM && !customAudience.name.trim()) return false
    return true
  }, [
    primary,
    secondary,
    isCompare,
    goal,
    customGoal,
    impression,
    customImpression,
    audience,
    customAudience.name,
  ])

  const uploadOne = useCallback(async (image: LocalImage) => {
    const body = new FormData()
    body.append('file', image.file)
    const response = await fetch('/api/upload', { method: 'POST', body })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'That image could not be uploaded.')
    return data as {
      storagePath: string
      originalName: string
      mimeType: 'image/png' | 'image/jpeg' | 'image/webp'
      byteSize: number
    }
  }, [])

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (!primary || busy) return
      setBusy(true)
      setError(null)

      try {
        const uploads = [await uploadOne(primary)]
        if (isCompare && secondary) uploads.push(await uploadOne(secondary))

        const images = uploads.map((upload, index) => ({
          ...upload,
          role: isCompare
            ? index === 0
              ? 'variant_a'
              : 'variant_b'
            : isAudit
              ? 'feed'
              : 'primary',
        }))

        const response = await fetch('/api/analyses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            visualType,
            platform,
            targetAudience: audience === CUSTOM ? customAudience.name : audience,
            customAudience:
              audience === CUSTOM
                ? {
                    name: customAudience.name,
                    familiarity: customAudience.familiarity,
                    knowledge: customAudience.knowledge,
                    sentiment: customAudience.sentiment,
                    cares: customAudience.cares,
                    desiredReaction: customAudience.desiredReaction,
                    context: '',
                  }
                : undefined,
            goal: goal === CUSTOM ? customGoal : goal,
            desiredImpression: impression === CUSTOM ? customImpression : impression,
            context,
            brandProfileId: brandProfileId || null,
            images,
          }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'The review could not be completed.')
        router.push(`/app/analysis/${data.analysis.id}`)
      } catch (thrown) {
        setError(thrown instanceof Error ? thrown.message : 'Something went wrong.')
        setBusy(false)
      }
    },
    [
      primary,
      secondary,
      busy,
      isCompare,
      isAudit,
      mode,
      visualType,
      platform,
      audience,
      customAudience,
      goal,
      customGoal,
      impression,
      customImpression,
      context,
      brandProfileId,
      uploadOne,
      router,
    ]
  )

  if (busy) {
    return (
      <AnalysisLoading
        previewUrls={[primary?.previewUrl, secondary?.previewUrl].filter(Boolean) as string[]}
      />
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
      {/* Canvas */}
      <div className="min-w-0">
        {isCompare ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="field-label">Variant A</p>
              <UploadZone
                label="The first version"
                image={primary}
                onChange={setPrimary}
                onError={setFileError}
                compact
              />
            </div>
            <div>
              <p className="field-label">Variant B</p>
              <UploadZone
                label="The second version"
                image={secondary}
                onChange={setSecondary}
                onError={setFileError}
                compact
              />
            </div>
          </div>
        ) : (
          <UploadZone
            label={
              isAudit
                ? 'A screenshot of a profile, feed, gallery or portfolio'
                : 'The visual you want reviewed'
            }
            image={primary}
            onChange={setPrimary}
            onError={setFileError}
          />
        )}

        {fileError && (
          <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {fileError}
          </p>
        )}

        <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-ink-soft">
          Your visual is processed by an external AI provider to generate the review. During the
          free beta, avoid uploading confidential or legally sensitive material.
        </p>
      </div>

      {/* Brief panel */}
      <div className="space-y-5 lg:border-l lg:border-line lg:pl-8">
        {!isAudit && (
          <div>
            <label htmlFor="visualType" className="field-label">
              Visual type
            </label>
            <select
              id="visualType"
              className="field"
              value={visualType}
              onChange={(event) => setVisualType(event.target.value)}
            >
              {VISUAL_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="platform" className="field-label">
            Where it will be published
          </label>
          <select
            id="platform"
            className="field"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
          >
            {PLATFORMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audience" className="field-label">
            Intended audience
          </label>
          <select
            id="audience"
            className="field"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          >
            {AUDIENCES.map((item) => (
              <option key={item}>{item}</option>
            ))}
            <option value={CUSTOM}>Custom audience…</option>
          </select>
        </div>

        {audience === CUSTOM && (
          <fieldset className="space-y-4 border border-line p-4">
            <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              Custom audience
            </legend>
            <div>
              <label htmlFor="ca-name" className="field-label">
                Who are they?
              </label>
              <input
                id="ca-name"
                className="field"
                value={customAudience.name}
                onChange={(event) =>
                  setCustomAudience((state) => ({ ...state, name: event.target.value }))
                }
                placeholder="Independent coffee shop owners"
                maxLength={80}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ca-fam" className="field-label">
                  Familiarity
                </label>
                <select
                  id="ca-fam"
                  className="field"
                  value={customAudience.familiarity}
                  onChange={(event) =>
                    setCustomAudience((state) => ({ ...state, familiarity: event.target.value }))
                  }
                >
                  {FAMILIARITY_LEVELS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ca-know" className="field-label">
                  Knowledge
                </label>
                <select
                  id="ca-know"
                  className="field"
                  value={customAudience.knowledge}
                  onChange={(event) =>
                    setCustomAudience((state) => ({ ...state, knowledge: event.target.value }))
                  }
                >
                  {KNOWLEDGE_LEVELS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="ca-sent" className="field-label">
                How they feel about you now
              </label>
              <select
                id="ca-sent"
                className="field"
                value={customAudience.sentiment}
                onChange={(event) =>
                  setCustomAudience((state) => ({ ...state, sentiment: event.target.value }))
                }
              >
                {SENTIMENT_LEVELS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ca-cares" className="field-label">
                What they care about
              </label>
              <input
                id="ca-cares"
                className="field"
                value={customAudience.cares}
                onChange={(event) =>
                  setCustomAudience((state) => ({ ...state, cares: event.target.value }))
                }
                placeholder="Margins, provenance, staff training"
                maxLength={300}
              />
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="goal" className="field-label">
            Primary goal
          </label>
          <select
            id="goal"
            className="field"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          >
            {GOALS.map((item) => (
              <option key={item}>{item}</option>
            ))}
            <option value={CUSTOM}>Custom…</option>
          </select>
          {goal === CUSTOM && (
            <input
              className="field mt-2"
              value={customGoal}
              onChange={(event) => setCustomGoal(event.target.value)}
              placeholder="What should this visual achieve?"
              maxLength={120}
              aria-label="Custom goal"
            />
          )}
        </div>

        <div>
          <label htmlFor="impression" className="field-label">
            Desired impression
          </label>
          <select
            id="impression"
            className="field"
            value={impression}
            onChange={(event) => setImpression(event.target.value)}
          >
            {IMPRESSIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
            <option value={CUSTOM}>Custom…</option>
          </select>
          {impression === CUSTOM && (
            <input
              className="field mt-2"
              value={customImpression}
              onChange={(event) => setCustomImpression(event.target.value)}
              placeholder="How should it feel?"
              maxLength={120}
              aria-label="Custom impression"
            />
          )}
        </div>

        <div>
          <label htmlFor="brandProfile" className="field-label">
            Brand Profile <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <select
            id="brandProfile"
            className="field"
            value={brandProfileId}
            onChange={(event) => setBrandProfileId(event.target.value)}
          >
            <option value="">No profile</option>
            {brandProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
                {profile.isDefault ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="context" className="field-label">
            Context <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="context"
            className="field min-h-[88px] resize-y"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Anything the reviewer should know — the campaign, the constraint, the history."
            maxLength={1200}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 border border-coral/40 bg-coral/5 p-3 text-sm text-coral"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {outOfReviews ? (
          <div className="border border-line bg-ivory p-4">
            <p className="text-sm text-ink">
              You have used today’s three beta reviews. Your limit resets tomorrow.
            </p>
          </div>
        ) : (
          <button type="submit" disabled={!ready} className="btn-primary w-full">
            {mode === 'visual_review'
              ? 'Review my visual'
              : mode === 'ab_compare'
                ? 'Compare the variants'
                : 'Audit my feed'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <p className="text-center text-xs text-ink-soft">
          {MODE_LABELS[mode]} · {remaining} of 3 reviews left today
        </p>
      </div>
    </form>
  )
}
