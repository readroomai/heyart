'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Clock, Columns2, Grid3x3, Menu, Settings, SquarePen, SwatchBook, X } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { cn } from '@/lib/cn'
import { BETA_DAILY_ANALYSIS_LIMIT } from '@/lib/options'

const PRIMARY = [
  { href: '/app/new', label: 'New Review', icon: SquarePen },
  { href: '/app/compare', label: 'Compare', icon: Columns2 },
  { href: '/app/audit', label: 'Feed Audit', icon: Grid3x3 },
  { href: '/app/brand-profiles', label: 'Brand Profiles', icon: SwatchBook },
  { href: '/app/history', label: 'History', icon: Clock },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <ul className="space-y-0.5">
      {PRIMARY.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-frame px-3 py-2.5 text-sm transition-colors',
                active ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-white hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function UsageMeter({ used }: { used: number }) {
  const remaining = Math.max(0, BETA_DAILY_ANALYSIS_LIMIT - used)
  return (
    <div className="border-t border-line px-3 py-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Today</p>
        <p className="tnum text-xs text-ink">
          {remaining} of {BETA_DAILY_ANALYSIS_LIMIT} left
        </p>
      </div>
      <div className="mt-2.5 flex gap-1" aria-hidden="true">
        {Array.from({ length: BETA_DAILY_ANALYSIS_LIMIT }, (_, index) => (
          <span
            key={index}
            className={cn('h-1 flex-1', index < used ? 'bg-line-strong' : 'bg-ink')}
          />
        ))}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-ink-soft">
        Free beta. Resets at midnight UTC.
      </p>
    </div>
  )
}

export function AppSidebar({ used, userSlot }: { used: number; userSlot?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ivory px-4 lg:hidden">
        <Link href="/app" aria-label="HiArt dashboard">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2">
          {userSlot}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="app-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="app-nav"
          className="fixed inset-x-0 top-14 z-40 h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-ivory p-4 lg:hidden"
        >
          <nav aria-label="Application">
            <NavList onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-6">
            <UsageMeter used={used} />
            <Link
              href="/app/settings"
              className="mt-2 flex items-center gap-3 rounded-frame px-3 py-2.5 text-sm text-ink-soft"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </div>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-ivory lg:flex">
        <div className="px-5 py-5">
          <Link href="/app" aria-label="HiArt dashboard">
            <Wordmark />
          </Link>
        </div>
        <nav aria-label="Application" className="flex-1 overflow-y-auto px-2">
          <NavList />
        </nav>
        <div className="px-2">
          <UsageMeter used={used} />
          <div className="border-t border-line py-2">
            <Link
              href="/app/settings"
              className="flex items-center gap-3 rounded-frame px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-white hover:text-ink"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <div className="px-3 py-2">{userSlot}</div>
          </div>
        </div>
      </aside>
    </>
  )
}
