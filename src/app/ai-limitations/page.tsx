import { LegalLayout, LegalSection } from '@/components/site/legal-layout'

export const metadata = {
  title: 'AI limitations',
  description: 'What HiArt can and cannot tell you about a visual, stated plainly.',
}

export default function AiLimitationsPage() {
  return (
    <LegalLayout
      eyebrow="AI limitations"
      title="What HiArt cannot tell you."
      updated="4 August 2026"
      intro="A HiArt report is a structured opinion produced by a vision model. Knowing where it stops being useful is part of using it well."
    >
      <LegalSection title="It is a model, not an audience">
        <p>
          HiArt estimates how a visual may be perceived. It has never met your audience, has no
          access to your analytics, and cannot run a test. It will not tell you that a visual will
          get more engagement, more clicks, more conversions or more reach — and any report that
          appeared to promise that would be wrong.
        </p>
        <p>
          Treat the score as a structured second opinion that makes your own judgement sharper, not
          as a verdict that replaces it.
        </p>
      </LegalSection>

      <LegalSection title="It does not judge people">
        <p>
          When a person appears in a visual, HiArt is instructed to comment only on framing,
          lighting, expression as visibly presented, styling, composition, hierarchy and brand
          context.
        </p>
        <p>
          It will not identify anyone, rate anyone&apos;s appearance, infer race, religion,
          sexuality, health, disability or political affiliation, diagnose personality or mental
          health, or describe a person as high or low value. If you ask it to, it should refuse.
        </p>
      </LegalSection>

      <LegalSection title="It can be wrong">
        <p>
          Vision models misread small text, unusual layouts, cultural references and context that
          sits outside the frame. Every report lists the assumptions the model had to make and a
          confidence figure — read those before acting on the recommendations.
        </p>
        <p>
          Two runs on the same image can differ. That is a property of the model, not a bug in your
          work.
        </p>
      </LegalSection>

      <LegalSection title="It has taste, and taste is a bias">
        <p>
          Models trained on a lot of design work tend to reward convention. HiArt is explicitly
          instructed not to recommend minimalism by default and not to strip personality in order to
          raise a professionalism score — but a distinctive, deliberately awkward or culturally
          specific choice may still be scored down simply for being uncommon.
        </p>
        <p>
          If the model tells you to remove the thing that makes the work yours, that is a case where
          you should probably disagree with it.
        </p>
      </LegalSection>

      <LegalSection title="Accessibility notes are a starting point">
        <p>
          HiArt flags likely contrast and legibility problems by eye. It does not compute exact
          contrast ratios from your source file. Use a proper contrast checker before shipping
          anything where accessibility compliance matters.
        </p>
      </LegalSection>

      <LegalSection title="Which model is used">
        <p>
          Reviews are produced by Google&apos;s Gemini vision models. The specific model is
          configurable, so the exact version behind a report can change as better models ship.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
