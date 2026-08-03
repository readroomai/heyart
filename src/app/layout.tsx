import type { Metadata, Viewport } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import { APP_URL, isClerkConfigured } from '@/lib/env'
import '@/styles/globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const editorial = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'HiArt — Know how your visuals land.',
    template: '%s · HiArt',
  },
  description:
    'Upload any visual and discover what people notice, feel, trust, misunderstand and remember before you publish it. AI visual perception and creative intelligence.',
  applicationName: 'HiArt',
  keywords: [
    'visual feedback',
    'design review',
    'AI design critique',
    'creative intelligence',
    'thumbnail review',
    'brand review',
  ],
  authors: [{ name: 'Gia Macool and the HiArt team' }],
  // Domain ownership verification for the Orynth listing.
  other: {
    'ory-verify': 'orynth-0c77cfc049164604af23a13f6b6b0657',
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'HiArt',
    title: 'HiArt — Know how your visuals land.',
    description:
      'AI visual perception and creative intelligence. See what people notice first, how a visual is perceived, and exactly what to improve.',
    url: APP_URL,
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'HiArt — Know how your visuals land.' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HiArt — Know how your visuals land.',
    description: 'AI visual perception and creative intelligence.',
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#F6F2EA',
  width: 'device-width',
  initialScale: 1,
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${editorial.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
            focus:rounded-frame focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Clerk only wraps the tree when it is configured, so the marketing site and
  // the public example still render on a fresh clone without credentials.
  if (!isClerkConfigured()) {
    return <Shell>{children}</Shell>
  }

  const { ClerkProvider } = await import('@clerk/nextjs')
  return (
    <ClerkProvider
      appearance={{
        layout: {
          // Hides Clerk's "Development mode" badge on test keys.
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: '#111111',
          colorBackground: '#FFFFFF',
          colorText: '#111111',
          colorTextSecondary: '#68645F',
          borderRadius: '2px',
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-none border border-line',
          formButtonPrimary: 'bg-ink hover:bg-[#2a2a2a] text-ivory normal-case text-sm',
          footerActionLink: 'text-cobalt hover:text-cobalt',
        },
      }}
    >
      <Shell>{children}</Shell>
    </ClerkProvider>
  )
}
