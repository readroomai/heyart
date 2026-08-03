import Link from 'next/link'
import { Wordmark } from '@/components/logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/#product', label: 'What it does' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/example', label: 'Example report' },
      { href: '/app/new', label: 'Review a visual' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/#about', label: 'About' },
      { href: '/ai-limitations', label: 'AI limitations' },
      { href: 'https://x.com/GiaMMacool', label: 'Gia on X' },
      { href: 'https://hiart.eu', label: 'hiart.eu' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="shell py-14 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              AI visual perception and creative intelligence. A second opinion on your work before
              it goes public.
            </p>
            <p className="mt-5 text-xs text-ink-soft">Made by Gia Macool and the HiArt team.</p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="eyebrow">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">© {new Date().getFullYear()} HiArt. Free beta.</p>
          <p className="text-xs text-ink-soft">
            HiArt gives an AI-assisted assessment, not a guarantee of how any audience will behave.
          </p>
        </div>
      </div>
    </footer>
  )
}
