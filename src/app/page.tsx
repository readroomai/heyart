import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { HeroDemo } from '@/components/marketing/hero-demo'
import { SampleCreative, SampleFeed } from '@/components/marketing/sample-creative'
import { AttentionMarker, ScoreDial, DimensionBar } from '@/components/report/primitives'
import { LogoIcon } from '@/components/logo'
import { SAMPLE_COMPARE_REPORT, SAMPLE_FEED_AUDIT, SAMPLE_VISUAL_REPORT } from '@/lib/sample-data'
import { getIdentity } from '@/lib/auth'

export default async function LandingPage() {
  const identity = await getIdentity().catch(() => null)

  return (
    <>
      <SiteHeader signedIn={Boolean(identity)} />
      <main id="main">
        <Hero />
        <FirstSight />
        <HowItWorks />
        <VisualReviewSection />
        <CompareSection />
        <FeedAuditSection />
        <SiblingSection />
        <BrandProfileSection />
        <ExampleSection />
        <PrivacySection />
        <FounderSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="pointer-events-none absolute inset-0 hairline-grid opacity-70"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 paper-tint" aria-hidden="true" />

      <div className="shell relative pb-16 pt-14 lg:pb-24 lg:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:gap-16">
          <div className="animate-rise-in">
            <p className="eyebrow">AI visual intelligence</p>
            <h1 className="mt-6 text-display-lg text-editorial">
              Before they read the caption,
              <br />
              <em className="italic">they see the creative.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lede text-ink-soft">
              Upload a post, thumbnail, advertisement, profile or landing page. HiArt shows what
              people notice first, how the visual may be perceived, and exactly what to improve.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/app/new" className="btn-primary">
                Review a visual
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/example" className="btn-secondary">
                See an example
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-soft">
              Private by default. Nothing is published on your behalf.
            </p>
          </div>

          <div className="hidden lg:block lg:pt-3">
            <dl className="space-y-6 border-l border-line pl-8">
              {[
                ['Three modes', 'Visual Review, A/B Compare, Feed Audit.'],
                ['Nine dimensions', 'Attention, clarity, hierarchy, trust and more.'],
                ['One revision brief', 'A prompt you can hand straight to a designer.'],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-sm font-medium text-ink">{term}</dt>
                  <dd className="mt-1 text-sm text-ink-soft">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 lg:mt-20" id="product">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}

function FirstSight() {
  return (
    <section className="border-b border-line">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="mt-5 text-section text-editorial">
              What people see first
              <br />
              <em className="italic">changes what they understand.</em>
            </h2>
          </div>
          <div className="max-w-prose">
            <p className="text-lede text-ink-soft">
              A viewer forms an impression of your work long before they read a word of it. Colour,
              crop, hierarchy and craft do that work — and they do it whether or not you intended
              them to.
            </p>
            <p className="mt-6 text-lede text-ink-soft">
              You cannot see your own visual for the first time twice. HiArt gives you that first
              look back: what the eye lands on, in what order, and what conclusion a stranger draws
              from it.
            </p>

            <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
              {[
                [
                  'Order',
                  'The eye moves in a sequence. That sequence is the argument your visual makes.',
                ],
                ['Read', 'Different audiences reach different conclusions from the same frame.'],
                ['Cost', 'Every fix trades something away. HiArt names the trade.'],
              ].map(([title, body]) => (
                <div key={title} className="bg-ivory p-6">
                  <h3 className="text-sm font-medium text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Upload the visual',
      body: 'A post, thumbnail, advertisement, slide, logo, screenshot or profile. PNG, JPEG or WebP, up to 8 MB.',
    },
    {
      n: '02',
      title: 'Set the brief',
      body: 'Where it will be published, who it is for, what you want it to do, and how it should feel.',
    },
    {
      n: '03',
      title: 'Read the review',
      body: 'A structured report: attention path, nine scored dimensions, five prioritised fixes and a revision prompt.',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-offset border-b border-line bg-white">
      <div className="shell py-section">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-5 text-section text-editorial">
            Three steps, about <em className="italic">ninety seconds.</em>
          </h2>
        </div>

        <ol className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="bg-white p-7 lg:p-9">
              <span className="tnum font-mono text-[11px] tracking-[0.16em] text-coral">
                {step.n}
              </span>
              <h3 className="mt-6 text-xl text-editorial">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function VisualReviewSection() {
  const report = SAMPLE_VISUAL_REPORT
  return (
    <section id="examples" className="scroll-offset border-b border-line">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Mode one · Visual Review</p>
            <h2 className="mt-5 text-section text-editorial">
              One visual, read the way
              <br />
              <em className="italic">an audience reads it.</em>
            </h2>
            <p className="mt-6 max-w-md text-lede text-ink-soft">
              Nine scored dimensions, an attention path, the interpretations different audiences are
              likely to reach, and five prioritised changes ordered by impact.
            </p>
            <Link href="/example" className="btn-secondary mt-8">
              Open the full example
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="plate shadow-frame">
            <div className="border-b border-line p-6">
              <ScoreDial score={report.visualScore} />
            </div>
            <div className="border-b border-line p-6">
              <p className="eyebrow">First impression</p>
              <p className="mt-3 text-xl leading-snug text-editorial">{report.firstImpression}</p>
            </div>
            <div className="px-6 pb-6">
              {(['attention', 'clarity', 'hierarchy', 'trust'] as const).map((key) => (
                <DimensionBar
                  key={key}
                  dimensionKey={key}
                  score={report.dimensions[key].score}
                  reason={report.dimensions[key].reason}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CompareSection() {
  const report = SAMPLE_COMPARE_REPORT
  return (
    <section className="border-b border-line bg-white">
      <div className="shell py-section">
        <div className="max-w-2xl">
          <p className="eyebrow">Mode two · A/B Compare</p>
          <h2 className="mt-5 text-section text-editorial">
            Two variants. <em className="italic">One clear recommendation.</em>
          </h2>
          <p className="mt-6 text-lede text-ink-soft">
            Stop choosing by committee. HiArt judges both against the goal you set — and names what
            you lose by picking the winner.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr] lg:gap-8">
          {(['a', 'b'] as const).map((variant) => {
            const data = variant === 'a' ? report.variantA : report.variantB
            const isWinner = report.recommendedVariant === variant.toUpperCase()
            return (
              <figure key={variant} className="plate">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                    Variant {variant.toUpperCase()}
                  </span>
                  {isWinner && (
                    <span className="bg-sunlight px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="relative aspect-[4/5] overflow-hidden border-b border-line">
                  <SampleCreative variant={variant} />
                </div>
                <figcaption className="flex items-baseline justify-between gap-4 p-4">
                  <p className="text-sm text-ink-soft">{data.title}</p>
                  <p className="tnum text-editorial text-3xl">{data.visualScore}</p>
                </figcaption>
              </figure>
            )
          })}

          <div className="plate flex flex-col">
            <div className="border-b border-line p-5">
              <p className="eyebrow">Verdict</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">{report.verdict}</p>
            </div>
            <div className="border-b border-line">
              {report.criteria.slice(0, 5).map((row) => (
                <div
                  key={row.criterion}
                  className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-b-0"
                >
                  <span className="text-sm text-ink-soft">{row.criterion}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                    {row.winner}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-5">
              <p className="eyebrow">The trade-off</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{report.majorTradeOff}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeedAuditSection() {
  const report = SAMPLE_FEED_AUDIT
  return (
    <section className="border-b border-line">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16">
          <div className="plate p-4 shadow-frame sm:p-6">
            <div className="relative aspect-[4/3] overflow-hidden border border-line">
              <SampleFeed />
              <AttentionMarker order={1} style={{ top: '46%', left: '22%' }} />
              <AttentionMarker order={2} style={{ top: '46%', left: '50%' }} />
              <span className="absolute bottom-3 left-3 z-20 bg-ivory px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                Sample screenshot
              </span>
            </div>
          </div>

          <div>
            <p className="eyebrow">Mode three · Feed Audit</p>
            <h2 className="mt-5 text-section text-editorial">
              Your profile is one image,
              <br />
              <em className="italic">not nine.</em>
            </h2>
            <p className="mt-6 max-w-md text-lede text-ink-soft">
              Upload a screenshot of a profile, feed, gallery or portfolio. HiArt reads it as a
              single body of work — what it says, what stays unclear, and where it contradicts
              itself.
            </p>

            <div className="mt-9 border-t border-line">
              <div className="flex items-baseline justify-between border-b border-line py-4">
                <span className="text-sm text-ink-soft">Appears to be about</span>
                <span className="max-w-[58%] text-right text-sm text-ink">
                  {report.appearsToBeAbout}
                </span>
              </div>
              {report.remainsUnclear.slice(0, 2).map((item) => (
                <div
                  key={item}
                  className="flex items-baseline justify-between border-b border-line py-4"
                >
                  <span className="text-sm text-ink-soft">Unclear</span>
                  <span className="max-w-[58%] text-right text-sm text-ink">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-ink-soft">
              Plus three visual directions and a seven-item checklist. HiArt never connects to a
              social platform — you upload your own screenshot.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SiblingSection() {
  return (
    <section className="border-b border-line bg-ink text-ivory">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="font-mono text-label uppercase tracking-[0.16em] text-ivory/50">
              A shared idea
            </p>
            <h2 className="mt-5 text-section text-editorial">
              Words have ReadRoom.
              <br />
              <em className="italic">Visuals have HiArt.</em>
            </h2>
          </div>
          <div className="max-w-prose self-center">
            <p className="text-lede text-ivory/70">
              ReadRoom helps people understand how written content may land. HiArt does the same for
              visual work. Two separate products, one belief: you deserve to know how something will
              be received before you publish it, not after.
            </p>
            <div className="mt-10 flex items-center gap-4 border-t border-line-invert pt-8">
              <LogoIcon className="h-7 w-7 text-ivory" />
              <p className="text-sm text-ivory/60">
                Independent tools. Related philosophy. Use either on its own.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BrandProfileSection() {
  return (
    <section className="border-b border-line bg-white">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Brand Profiles</p>
            <h2 className="mt-5 text-section text-editorial">
              Teach it your brand <em className="italic">once.</em>
            </h2>
            <p className="mt-6 max-w-md text-lede text-ink-soft">
              Save your audience, personality, colours and the words your brand should never be
              described as. Attach a profile to any review and brand fit is judged against your
              actual identity — not a generic idea of good design.
            </p>
            <p className="mt-5 text-sm text-ink-soft">Up to three profiles during the free beta.</p>
          </div>

          <div className="plate p-6 shadow-frame">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Brand Profile</p>
                <p className="mt-2 text-xl text-editorial">Northbound Coffee</p>
              </div>
              <span className="border border-line-strong px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                Default
              </span>
            </div>

            <dl className="mt-7 space-y-4 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-6">
                <dt className="text-ink-soft">Audience</dt>
                <dd className="text-right text-ink">Speciality coffee buyers</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink-soft">Personality</dt>
                <dd className="text-right text-ink">Warm, considered, unhurried</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink-soft">Should feel</dt>
                <dd className="text-right text-ink">Crafted · Honest · Premium</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-ink-soft">Never</dt>
                <dd className="text-right text-ink">Corporate · Shouty · Cheap</dd>
              </div>
            </dl>

            <div className="mt-7 border-t border-line pt-6">
              <p className="eyebrow">Palette</p>
              <div className="mt-3 flex gap-2">
                {['#3A2B20', '#8A6244', '#E9E2D6', '#F26445'].map((colour) => (
                  <div key={colour} className="flex-1">
                    <div className="h-10 border border-line" style={{ backgroundColor: colour }} />
                    <p className="mt-2 font-mono text-[10px] text-ink-soft">{colour}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ExampleSection() {
  const report = SAMPLE_VISUAL_REPORT
  return (
    <section className="border-b border-line">
      <div className="shell py-section">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">An example report</p>
            <h2 className="mt-5 text-section text-editorial">
              Not a wall of text. <em className="italic">A creative review.</em>
            </h2>
          </div>
          <Link href="/example" className="btn-primary">
            Read the full report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-px border border-line bg-line lg:grid-cols-3">
          <div className="bg-ivory p-7">
            <p className="eyebrow">What works</p>
            <ul className="mt-5 space-y-3">
              {report.whatWorks.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-cobalt"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ivory p-7">
            <p className="eyebrow">What weakens it</p>
            <ul className="mt-5 space-y-3">
              {report.whatWeakensIt.slice(0, 3).map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-coral"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ivory p-7">
            <p className="eyebrow">Leave alone</p>
            <ul className="mt-5 space-y-3">
              {report.preserve.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink-soft"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border border-line bg-white p-7">
          <p className="eyebrow">Revision brief</p>
          <p className="mt-4 max-w-prose text-lede leading-relaxed text-ink">
            {report.revisionBrief}
          </p>
        </div>
      </div>
    </section>
  )
}

function PrivacySection() {
  return (
    <section className="border-b border-line bg-white">
      <div className="shell py-section">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <div>
            <p className="eyebrow">Honest terms</p>
            <h2 className="mt-5 text-section text-editorial">
              What HiArt <em className="italic">cannot</em> tell you.
            </h2>
          </div>
          <div className="lg:col-span-2">
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {[
                [
                  'It is an opinion, not a measurement',
                  'HiArt models how a visual may be perceived. It cannot predict engagement, conversion or reach, and it will never claim to.',
                ],
                [
                  'It does not judge people',
                  'When a person appears, HiArt comments on framing, lighting, styling and composition. It never identifies anyone or rates appearance.',
                ],
                [
                  'Your uploads stay private',
                  'Images go to private storage and analyses are private by default. Sharing is an explicit action, and every share link can be revoked.',
                ],
                [
                  'An external model reads your image',
                  'Your visual is processed by an external AI provider to generate the review. During the free beta, avoid uploading confidential material.',
                ],
              ].map(([title, body]) => (
                <div key={title} className="bg-white p-7">
                  <h3 className="text-sm font-medium text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-6">
              <Link
                href="/ai-limitations"
                className="text-sm text-cobalt underline underline-offset-4"
              >
                Read the full AI limitations
              </Link>
              <Link href="/privacy" className="text-sm text-cobalt underline underline-offset-4">
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FounderSection() {
  return (
    <section id="about" className="scroll-offset border-b border-line">
      <div className="shell py-section">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-center">From the founder</p>
          <blockquote className="mt-10">
            <p className="text-center text-[clamp(1.4rem,2.6vw,2.1rem)] leading-[1.35] text-editorial">
              “My team and I created HiArt because people often judge a visual before they read a
              single word. We wanted to give creators and brands a useful second opinion before
              their work goes public.”
            </p>
            <footer className="mt-9 flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
              <div className="text-center">
                <a
                  href="https://x.com/GiaMMacool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                  Gia Macool
                </a>
                <p className="text-xs text-ink-soft">Founder, HiArt · @GiaMMacool</p>
              </div>
              <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-ink text-ivory">
      <div className="shell py-section text-center">
        <p className="font-mono text-label uppercase tracking-[0.16em] text-ivory/50">
          Free beta · three reviews a day
        </p>
        <h2 className="mx-auto mt-7 max-w-3xl text-display text-editorial">
          Know how your visuals land
          <br />
          <em className="italic">before you publish them.</em>
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/app/new"
            className="btn rounded-frame bg-ivory px-6 py-3.5 text-sm font-medium text-ink hover:bg-white"
          >
            Review a visual
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/example"
            className="btn rounded-frame border border-line-invert px-6 py-3.5 text-sm text-ivory hover:bg-ivory hover:text-ink"
          >
            See an example first
          </Link>
        </div>
        <p className="mt-7 text-xs text-ivory/50">
          No card required. Nothing is published on your behalf.
        </p>
      </div>
    </section>
  )
}
