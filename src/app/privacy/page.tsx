import { LegalLayout, LegalSection } from '@/components/site/legal-layout'

export const metadata = {
  title: 'Privacy',
  description: 'What HiArt stores, what it sends to an AI provider, and how to delete it.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="What we hold, and what we send."
      updated="4 August 2026"
      intro="HiArt is a free beta. This page describes what actually happens to your images and data today — not what we intend to do later."
    >
      <LegalSection title="What we collect">
        <p>
          When you create an account, our authentication provider (Clerk) gives us your user
          identifier, your name where you have supplied one, and your email address. We store those
          so we can attach your reviews to your account.
        </p>
        <p>
          When you run a review we store the image you uploaded, the brief you selected (platform,
          audience, goal, desired impression, and any context you typed), and the report the model
          returned.
        </p>
      </LegalSection>

      <LegalSection title="Where your images go">
        <p>
          Uploaded images are stored in a private Supabase Storage bucket. Nothing in that bucket is
          publicly readable. When an image needs to be displayed, our server generates a short-lived
          signed URL for it.
        </p>
        <p>
          To produce a review, your image and your brief are sent to Google&apos;s Gemini API. That
          is an external AI provider with its own terms and its own data-handling practices, which
          we do not control. During the free beta, please avoid uploading confidential, regulated or
          legally sensitive material.
        </p>
        <p>
          We do not claim zero retention by the AI provider, because that is not something we can
          currently guarantee on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="What is private by default">
        <p>
          Every analysis is private to your account. Nothing is published anywhere on your behalf,
          and HiArt never connects to your social accounts.
        </p>
        <p>
          A report only becomes publicly reachable if you explicitly create a share link. On a
          shared report the uploaded image is hidden unless you choose to reveal it, and a visitor
          who opens the link still has to click to see it. Your email address, the private context
          you typed, the internal prompts and the storage paths are never included on a shared page.
          You can revoke any share link at any time, which takes effect immediately.
        </p>
      </LegalSection>

      <LegalSection title="Logging">
        <p>
          We do not write uploaded images, image data or AI prompts into application logs. Server
          errors are logged with the error type and message only.
        </p>
      </LegalSection>

      <LegalSection title="Deleting your data">
        <p>
          Deleting a review deletes its stored images at the same time. Deleting your account
          removes your reviews, Brand Profiles, share links, usage records and uploaded files.
          Account deletion is available from the account menu inside the app.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          HiArt sets the cookies required for authentication. We do not run advertising trackers or
          third-party analytics profiling.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For any privacy question, or to request deletion of something you cannot remove yourself,
          contact us through hiart.eu.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
