'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus, Star, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BETA_BRAND_PROFILE_LIMIT, IMPRESSIONS, PLATFORMS } from '@/lib/options'

export type ProfileItem = {
  id: string
  name: string
  description: string
  targetAudience: string
  personality: string
  desiredImpression: string
  primaryPlatform: string
  primaryColours: string[]
  secondaryColours: string[]
  positiveWords: string[]
  negativeWords: string[]
  isDefault: boolean
}

const EMPTY = {
  name: '',
  description: '',
  targetAudience: '',
  personality: '',
  desiredImpression: IMPRESSIONS[0] as string,
  primaryPlatform: PLATFORMS[0] as string,
  primaryColours: '',
  secondaryColours: '',
  positiveWords: '',
  negativeWords: '',
  isDefault: false,
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function BrandProfileManager({ profiles }: { profiles: ProfileItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(profiles)
  const [editing, setEditing] = useState<ProfileItem | 'new' | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const atLimit = items.length >= BETA_BRAND_PROFILE_LIMIT

  function openNew() {
    setForm({ ...EMPTY, isDefault: items.length === 0 })
    setEditing('new')
    setError(null)
  }

  function openEdit(profile: ProfileItem) {
    setForm({
      name: profile.name,
      description: profile.description,
      targetAudience: profile.targetAudience,
      personality: profile.personality,
      desiredImpression: profile.desiredImpression || IMPRESSIONS[0],
      primaryPlatform: profile.primaryPlatform || PLATFORMS[0],
      primaryColours: profile.primaryColours.join(', '),
      secondaryColours: profile.secondaryColours.join(', '),
      positiveWords: profile.positiveWords.join(', '),
      negativeWords: profile.negativeWords.join(', '),
      isDefault: profile.isDefault,
    })
    setEditing(profile)
    setError(null)
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description,
      targetAudience: form.targetAudience,
      personality: form.personality,
      desiredImpression: form.desiredImpression,
      primaryPlatform: form.primaryPlatform,
      primaryColours: splitList(form.primaryColours),
      secondaryColours: splitList(form.secondaryColours),
      positiveWords: splitList(form.positiveWords),
      negativeWords: splitList(form.negativeWords),
      isDefault: form.isDefault,
    }

    const isNew = editing === 'new'
    const response = await fetch(
      isNew ? '/api/brand-profiles' : `/api/brand-profiles/${(editing as ProfileItem).id}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(data.error || 'That profile could not be saved.')
      setBusy(false)
      return
    }

    const saved = data.brandProfile as ProfileItem
    setItems((state) => {
      const next = isNew
        ? [...state, saved]
        : state.map((row) => (row.id === saved.id ? saved : row))
      return saved.isDefault
        ? next.map((row) => ({ ...row, isDefault: row.id === saved.id }))
        : next
    })
    setEditing(null)
    setBusy(false)
    router.refresh()
  }

  async function remove(profile: ProfileItem) {
    if (!window.confirm(`Delete the “${profile.name}” profile?`)) return
    const response = await fetch(`/api/brand-profiles/${profile.id}`, { method: 'DELETE' })
    if (response.ok) {
      setItems((state) => state.filter((row) => row.id !== profile.id))
      router.refresh()
    } else {
      setError('That profile could not be deleted.')
    }
  }

  async function makeDefault(profile: ProfileItem) {
    const response = await fetch(`/api/brand-profiles/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    if (response.ok) {
      setItems((state) => state.map((row) => ({ ...row, isDefault: row.id === profile.id })))
      router.refresh()
    } else {
      setError('That profile could not be set as default.')
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-6 border border-coral/40 bg-coral/5 p-3 text-sm text-coral">
          {error}
        </p>
      )}

      {editing ? (
        <form onSubmit={save} className="border border-line bg-ivory p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl text-editorial">
              {editing === 'new' ? 'New Brand Profile' : `Edit ${(editing as ProfileItem).name}`}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex h-9 w-9 items-center justify-center text-ink-soft hover:text-ink"
              aria-label="Close the profile editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="bp-name" className="field-label">
                Brand or creator name
              </label>
              <input
                id="bp-name"
                className="field"
                required
                maxLength={80}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Northbound Coffee"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bp-desc" className="field-label">
                Short description
              </label>
              <textarea
                id="bp-desc"
                className="field min-h-[72px] resize-y"
                maxLength={600}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="A small-batch roaster selling direct to speciality drinkers."
              />
            </div>

            <div>
              <label htmlFor="bp-audience" className="field-label">
                Target audience
              </label>
              <input
                id="bp-audience"
                className="field"
                maxLength={300}
                value={form.targetAudience}
                onChange={(event) => setForm({ ...form, targetAudience: event.target.value })}
                placeholder="Speciality coffee buyers, 25–45"
              />
            </div>

            <div>
              <label htmlFor="bp-personality" className="field-label">
                Brand personality
              </label>
              <input
                id="bp-personality"
                className="field"
                maxLength={300}
                value={form.personality}
                onChange={(event) => setForm({ ...form, personality: event.target.value })}
                placeholder="Warm, considered, unhurried"
              />
            </div>

            <div>
              <label htmlFor="bp-impression" className="field-label">
                Desired impression
              </label>
              <select
                id="bp-impression"
                className="field"
                value={form.desiredImpression}
                onChange={(event) => setForm({ ...form, desiredImpression: event.target.value })}
              >
                {IMPRESSIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bp-platform" className="field-label">
                Primary platform
              </label>
              <select
                id="bp-platform"
                className="field"
                value={form.primaryPlatform}
                onChange={(event) => setForm({ ...form, primaryPlatform: event.target.value })}
              >
                {PLATFORMS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bp-primary" className="field-label">
                Primary colours
              </label>
              <input
                id="bp-primary"
                className="field"
                value={form.primaryColours}
                onChange={(event) => setForm({ ...form, primaryColours: event.target.value })}
                placeholder="#3A2B20, #8A6244"
              />
              <p className="mt-1.5 text-xs text-ink-soft">Hex values, comma separated.</p>
            </div>

            <div>
              <label htmlFor="bp-secondary" className="field-label">
                Secondary colours
              </label>
              <input
                id="bp-secondary"
                className="field"
                value={form.secondaryColours}
                onChange={(event) => setForm({ ...form, secondaryColours: event.target.value })}
                placeholder="#E9E2D6, #F26445"
              />
            </div>

            <div>
              <label htmlFor="bp-positive" className="field-label">
                Words that describe the brand
              </label>
              <input
                id="bp-positive"
                className="field"
                value={form.positiveWords}
                onChange={(event) => setForm({ ...form, positiveWords: event.target.value })}
                placeholder="Crafted, honest, premium"
              />
            </div>

            <div>
              <label htmlFor="bp-negative" className="field-label">
                Words it should never be
              </label>
              <input
                id="bp-negative"
                className="field"
                value={form.negativeWords}
                onChange={(event) => setForm({ ...form, negativeWords: event.target.value })}
                placeholder="Corporate, shouty, cheap"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink md:col-span-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
                className="h-4 w-4 accent-ink"
              />
              Use this profile by default on new reviews
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !form.name.trim()} className="btn-primary">
              {busy ? 'Saving…' : 'Save profile'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">
              {items.length} of {BETA_BRAND_PROFILE_LIMIT} profiles used during the free beta.
            </p>
            <button
              type="button"
              onClick={openNew}
              disabled={atLimit}
              className="btn-primary"
              title={atLimit ? 'Delete a profile to add another' : undefined}
            >
              <Plus className="h-4 w-4" />
              New profile
            </button>
          </div>

          {items.length === 0 ? (
            <div className="mt-8 border border-dashed border-line-strong px-6 py-20 text-center">
              <p className="text-lg text-editorial">No Brand Profiles yet.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
                Save your audience, personality, colours and the words your brand should never be
                described as.
              </p>
              <button type="button" onClick={openNew} className="btn-primary mt-7">
                <Plus className="h-4 w-4" />
                Create your first profile
              </button>
            </div>
          ) : (
            <ul className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
              {items.map((profile) => (
                <li key={profile.id} className="bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl text-editorial">{profile.name}</h2>
                      {profile.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                          {profile.description}
                        </p>
                      )}
                    </div>
                    {profile.isDefault && (
                      <span className="shrink-0 border border-line-strong px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                        Default
                      </span>
                    )}
                  </div>

                  {profile.primaryColours.length > 0 && (
                    <div className="mt-5 flex gap-1.5">
                      {[...profile.primaryColours, ...profile.secondaryColours]
                        .slice(0, 6)
                        .map((colour, index) => (
                          <span
                            key={`${colour}-${index}`}
                            className="h-7 w-7 border border-line"
                            style={{ backgroundColor: colour }}
                            title={colour}
                          />
                        ))}
                    </div>
                  )}

                  {profile.positiveWords.length > 0 && (
                    <p className="mt-5 text-sm text-ink-soft">
                      <span className="text-ink">Should feel:</span>{' '}
                      {profile.positiveWords.join(' · ')}
                    </p>
                  )}
                  {profile.negativeWords.length > 0 && (
                    <p className="mt-1.5 text-sm text-ink-soft">
                      <span className="text-ink">Never:</span> {profile.negativeWords.join(' · ')}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(profile)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    {!profile.isDefault && (
                      <button
                        type="button"
                        onClick={() => makeDefault(profile)}
                        className="btn-ghost"
                      >
                        <Star className="h-4 w-4" />
                        Set as default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(profile)}
                      className={cn('btn-ghost ml-auto hover:text-coral')}
                      aria-label={`Delete ${profile.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
