import { SiteHeader } from './header'
import { SiteFooter } from './footer'

export function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  updated: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="shell py-14 lg:py-20">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-display text-editorial">{title}</h1>
            <p className="mt-6 max-w-2xl text-lede text-ink-soft">{intro}</p>
            <p className="mt-6 text-xs text-ink-soft">Last updated {updated}</p>
          </div>
        </section>
        <section className="shell py-14 lg:py-20">
          <div className="max-w-prose space-y-10">{children}</div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl text-editorial">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}
