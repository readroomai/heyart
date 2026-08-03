'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { ImageUp, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { validateImageFile, formatBytes } from '@/lib/validation'
import { ACCEPTED_MIME_TYPES } from '@/lib/options'

export type LocalImage = {
  file: File
  previewUrl: string
}

export function UploadZone({
  label,
  image,
  onChange,
  onError,
  compact = false,
}: {
  label: string
  image: LocalImage | null
  onChange: (image: LocalImage | null) => void
  onError: (message: string | null) => void
  compact?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return
      const check = validateImageFile({ name: file.name, type: file.type, size: file.size })
      if (!check.ok) {
        onError(check.reason)
        return
      }
      onError(null)
      onChange({ file, previewUrl: URL.createObjectURL(file) })
    },
    [onChange, onError]
  )

  const clear = useCallback(() => {
    if (image) URL.revokeObjectURL(image.previewUrl)
    onChange(null)
    onError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [image, onChange, onError])

  if (image) {
    return (
      <figure className="relative">
        <div className="relative overflow-hidden border border-line bg-ivory">
          <img
            src={image.previewUrl}
            alt={`Preview of ${image.file.name}`}
            className={cn(
              'mx-auto block w-full object-contain',
              compact ? 'max-h-64' : 'max-h-[440px]'
            )}
          />
        </div>
        <figcaption className="mt-3 flex items-center justify-between gap-4">
          <span className="min-w-0 truncate text-sm text-ink-soft">
            {image.file.name} · {formatBytes(image.file.size)}
          </span>
          <button
            type="button"
            onClick={clear}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </figcaption>
      </figure>
    )
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        accept(event.dataTransfer.files[0])
      }}
      className={cn(
        'flex flex-col items-center justify-center border border-dashed px-6 text-center transition-colors',
        compact ? 'py-12' : 'py-20',
        dragging ? 'border-ink bg-white' : 'border-line-strong bg-ivory/60'
      )}
    >
      <ImageUp className="h-6 w-6 text-ink-soft" aria-hidden="true" />
      <label htmlFor={inputId} className="mt-5 cursor-pointer text-[15px] text-ink">
        <span className="underline underline-offset-4">Choose a file</span>
        <span className="text-ink-soft"> or drag it here</span>
      </label>
      <p className="mt-2 text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-xs text-ink-soft">PNG, JPEG or WebP · up to 8 MB</p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => accept(event.target.files?.[0])}
      />
    </div>
  )
}
