'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Wordmark } from '@/components/logo'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#examples', label: 'Examples' },
  { href: '/#about', label: 'About' },
  { href: 'https://x.com/GiaMMacool', label: 'Gia on X', external: true },
]

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-line bg-ivory/90 backdrop-blur-md' : 'border-transparent bg-ivory'
      )}
    >
      <div className="shell flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link href="/" aria-label="HiArt home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <Link href="/app" className="btn-primary">
              Open HiArt
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/app/new" className="btn-primary">
                Review a visual
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ivory lg:hidden"
        >
          <nav aria-label="Mobile" className="shell flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="border-b border-line py-4 text-lg text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {signedIn ? (
                <Link href="/app" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Open HiArt
                </Link>
              ) : (
                <>
                  <Link
                    href="/app/new"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full"
                  >
                    Review a visual
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="btn-secondary w-full"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
