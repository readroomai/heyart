import { cn } from '@/lib/cn'

/**
 * The HiArt mark: two crop-mark corners implying a frame, with a single
 * observation point at its centre. A gallery crop reduced to its minimum —
 * legible at 24px, works solid black or solid white.
 */
export function LogoIcon({ className, title = 'HiArt' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn('h-6 w-6', className)}
    >
      <path d="M3.25 8.5V3.25H8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
      <path
        d="M20.75 15.5V20.75H15.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="square"
      />
      <path d="M15.5 3.25h5.25V8.5" stroke="currentColor" strokeWidth="1.7" opacity="0.28" />
      <path d="M8.5 20.75H3.25V15.5" stroke="currentColor" strokeWidth="1.7" opacity="0.28" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}

/** Full wordmark. The mark plus the lowercase "hiart" lettering. */
export function Wordmark({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoIcon className={cn('h-[22px] w-[22px]', iconClassName)} title="HiArt" />
      <span
        className={cn('text-[19px] font-medium leading-none tracking-[-0.02em]', textClassName)}
      >
        hiart
      </span>
    </span>
  )
}
