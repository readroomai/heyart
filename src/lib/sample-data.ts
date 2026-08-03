import type { CompareReport, FeedAuditReport, VisualReport } from './schemas'

/**
 * A pre-generated example used by the landing page and the public example
 * report. It is always labelled as a sample and never consumes an AI request.
 */
export const SAMPLE_VISUAL_REPORT: VisualReport = {
  title: 'Launch announcement — Northbound Coffee',
  visualScore: 71,
  firstImpression:
    'A confident product photograph that looks premium, but takes a moment to explain what is actually being announced.',
  primaryMessage:
    'A small-batch coffee brand is presenting a new bag design as something considered and crafted.',
  likelyEmotionalResponse:
    'Calm approval rather than urgency. The restraint reads as quality, though it does not create a reason to act now.',
  intendedMessageAlignment:
    'The premium impression lands. The stated goal of launching a product is only partly served, because the word "new" never appears at a size that survives a feed.',
  attentionPath: [
    {
      order: 1,
      element: 'The coffee bag in the centre-right third',
      reason: 'It is the highest-contrast object and sits on the strongest diagonal.',
    },
    {
      order: 2,
      element: 'The headline set in the upper left',
      reason: 'It occupies clear space, so the eye moves there once the object is registered.',
    },
    {
      order: 3,
      element: 'The small roast details along the lower edge',
      reason: 'Low contrast and small type place it last in the reading order.',
    },
  ],
  dimensions: {
    attention: {
      score: 68,
      reason:
        'The composition is calm. It holds up when looked at, but it does not interrupt a scroll.',
    },
    clarity: {
      score: 62,
      reason: 'The product is obvious; the announcement is not. Nothing states what has changed.',
    },
    hierarchy: {
      score: 74,
      reason:
        'Three clear tiers, though the headline and the product compete slightly for first place.',
    },
    trust: {
      score: 82,
      reason: 'Consistent lighting, honest product photography and no exaggerated claims.',
    },
    professionalism: {
      score: 85,
      reason: 'Even margins, one typeface family, controlled palette. The craft is visible.',
    },
    brandFit: {
      score: 79,
      reason:
        'Matches the stated warm, considered personality, though it leans cooler than the brand colours.',
    },
    originality: {
      score: 54,
      reason: 'The single-product-on-neutral-ground layout is the default for the category.',
    },
    platformFit: {
      score: 63,
      reason: 'The wide crop will lose its lower third in an Instagram feed preview.',
    },
    readability: {
      score: 58,
      reason: 'The roast details sit near the contrast floor at feed scale.',
    },
  },
  audienceReads: [
    {
      audience: 'New followers',
      interpretation: 'An established speciality roaster, probably not cheap.',
      positiveSignal: 'The restraint signals confidence and quality.',
      concern: 'Nothing explains why this particular post is worth stopping for.',
    },
    {
      audience: 'Existing customers',
      interpretation: 'A familiar brand showing something that looks like a new bag.',
      positiveSignal: 'The packaging change is visible to anyone who knows the old one.',
      concern: 'They may not realise the blend itself has changed, not just the design.',
    },
    {
      audience: 'Premium buyers',
      interpretation: 'A serious roaster worth investigating.',
      positiveSignal: 'Material texture and lighting do real work here.',
      concern: 'No origin or process cue is legible, which is the detail this group looks for.',
    },
  ],
  whatWorks: [
    'The lighting gives the packaging real material presence.',
    'A restrained palette keeps attention on the product.',
    'Generous margins make the composition feel deliberate rather than filled.',
    'Type is consistent and well set.',
  ],
  whatWeakensIt: [
    'The announcement itself is never stated at a legible size.',
    'The lower third carries information that a feed crop will remove.',
    'Roast details fall below comfortable contrast.',
    'The layout is close to the category default, so it blends with competitors.',
  ],
  misunderstandingRisks: [
    'A viewer may read this as a restock rather than a launch.',
    'The muted palette may suggest decaf to some viewers.',
  ],
  accessibilityConcerns: [
    'The lower-edge details sit around 3:1 against the background — below the 4.5:1 guideline for small text.',
    'At feed scale the roast details fall under roughly 12px effective size.',
  ],
  platformNotes: [
    'Instagram crops this to 4:5 in feed, taking the lower third with it.',
    'The first-frame thumbnail will show only the bag, with no words at all.',
    'Saving behaviour on this platform favours images with one legible claim.',
  ],
  priorityImprovements: [
    {
      priority: 1,
      change: 'State the announcement in the upper third.',
      why: 'The goal is a launch, but nothing currently signals that anything is new.',
      how: 'Add a short line above the headline — "New single origin" — at roughly a third of the headline size.',
      expectedEffect: 'A viewer understands the point of the post before reading anything else.',
    },
    {
      priority: 2,
      change: 'Move the roast details out of the lower third.',
      why: 'The platform crop removes that band entirely in feed.',
      how: 'Relocate them beside the bag as a two-line block, aligned to the existing left margin.',
      expectedEffect: 'The supporting detail survives the crop.',
    },
    {
      priority: 3,
      change: 'Raise the contrast of the small type.',
      why: 'It currently sits below the accessibility guideline for small text.',
      how: 'Darken the type to the brand’s deepest brown rather than the mid-tone.',
      expectedEffect: 'The detail becomes readable at feed scale and on lower-quality screens.',
    },
    {
      priority: 4,
      change: 'Break the category default with one deliberate choice.',
      why: 'The single-product-on-neutral layout is what every competitor also posts.',
      how: 'Either crop far tighter than the category norm, or let the bag break the frame edge.',
      expectedEffect: 'Recognition improves without changing the premium tone.',
    },
    {
      priority: 5,
      change: 'Export a 4:5 variant rather than cropping the wide one.',
      why: 'The composition was designed for a ratio the feed will not show.',
      how: 'Rebuild the layout at 1080×1350 with the same margins recalculated, not scaled.',
      expectedEffect: 'The intended composition is what people actually see.',
    },
  ],
  preserve: [
    'The lighting setup and the material rendering of the packaging.',
    'The restrained palette.',
    'The generous margin system.',
  ],
  revisionBrief:
    'Keep the photography and the restraint — they are doing the premium work well. The problem is that the post does not announce anything. Add a short "new" line in the upper third, rebuild at 4:5 so the lower band is not lost to the feed crop, and darken the small type to a readable contrast. Then make one non-default compositional choice so the piece is not interchangeable with every other roaster in the category.',
  creativeRevisionPrompt:
    'Rebuild this coffee launch graphic at 1080×1350. Keep the existing product photography, lighting and warm neutral palette. Add a short announcement line in the upper third above the headline, at roughly one third of the headline size, reading as a launch rather than a restock. Move the roast detail block from the lower edge to a left-aligned two-line block beside the product, using the brand’s deepest brown for at least 4.5:1 contrast. Recalculate margins for the new ratio rather than scaling them. Introduce one deliberate break from category convention — either a much tighter crop or letting the product break the frame edge — while keeping the calm, premium tone.',
  assumptions: [
    'The stated goal was a product launch rather than a general brand post.',
    'This will run primarily as an Instagram feed post.',
    'The brand colours supplied in the Brand Profile are current.',
  ],
  confidence: 0.74,
}

export const SAMPLE_COMPARE_REPORT: CompareReport = {
  title: 'Pricing page hero — A/B',
  recommendedVariant: 'B',
  verdict:
    'Variant B communicates the offer faster, at the cost of some of the atmosphere that made Variant A distinctive.',
  variantA: {
    ...SAMPLE_VISUAL_REPORT,
    title: 'Variant A — atmospheric',
    visualScore: 66,
    firstImpression: 'Handsome and moody, but the offer takes a beat to surface.',
  },
  variantB: {
    ...SAMPLE_VISUAL_REPORT,
    title: 'Variant B — direct',
    visualScore: 78,
    firstImpression: 'The offer lands immediately, though the frame feels more ordinary.',
  },
  criteria: [
    {
      criterion: 'Communicates the stated goal',
      winner: 'B',
      reason: 'The value proposition is legible before any scrolling.',
    },
    {
      criterion: 'Visual hierarchy',
      winner: 'B',
      reason: 'One clear focal point rather than two competing ones.',
    },
    { criterion: 'Clarity', winner: 'B', reason: 'Shorter line length and a single claim.' },
    {
      criterion: 'Trust',
      winner: 'Tie',
      reason: 'Both avoid inflated claims and use consistent craft.',
    },
    {
      criterion: 'Platform fit',
      winner: 'B',
      reason: 'Survives a narrow viewport without losing the headline.',
    },
    {
      criterion: 'Memorability',
      winner: 'A',
      reason: 'The atmospheric treatment is more distinctive at a glance.',
    },
  ],
  majorTradeOff:
    'Choosing B trades a distinctive mood for immediate comprehension. The page will convert its intent more clearly and look more like its competitors.',
  strongestFromA: [
    'The atmospheric background treatment.',
    'The typographic pairing in the subheading.',
  ],
  strongestFromB: ['The single-claim headline.', 'The clear primary action placement.'],
  combinedDirection:
    'Take B’s headline structure and action placement, then reintroduce A’s background treatment at lower intensity behind it. Keep A’s subheading pairing. The result keeps the immediate read while recovering the distinctiveness that made A worth looking at.',
  assumptions: [
    'Both variants target the same audience segment.',
    'The page is viewed most often on a narrow desktop viewport.',
  ],
  confidence: 0.68,
}

export const SAMPLE_FEED_AUDIT: FeedAuditReport = {
  title: 'Studio profile audit',
  visualScore: 64,
  immediatePositioning:
    'A design studio that photographs its work well, but has not stated what kind of work it wants.',
  appearsToBeAbout: 'Brand identity work, with occasional interior and product photography.',
  remainsUnclear: [
    'Whether the studio takes on clients or only shows finished work.',
    'Which discipline is the core offer.',
    'Where the studio is based.',
  ],
  dimensions: {
    consistency: {
      score: 58,
      reason: 'Two distinct colour treatments alternate without an obvious rule.',
    },
    recognition: {
      score: 52,
      reason: 'No repeated visual signature carries across the grid.',
    },
    variety: { score: 76, reason: 'The range of subject matter is genuinely varied.' },
    professionalism: { score: 81, reason: 'Individual pieces are well finished and well shot.' },
    trust: { score: 60, reason: 'Work is shown, but nothing indicates who it was made for.' },
  },
  repetition: [
    'Three consecutive flat-lay compositions at the same angle.',
    'The same warm filter applied to unrelated subjects.',
  ],
  conflictingStyles: [
    'High-contrast editorial crops sit beside soft pastel product shots.',
    'Two unrelated typographic systems appear across cover images.',
  ],
  trustSignals: [
    'Client names are absent from every piece.',
    'No contact route is visible from the profile header.',
  ],
  directions: [
    {
      name: 'Editorial studio',
      description:
        'Commit to the high-contrast crops, remove the pastel work, and let type carry the identity.',
      tradeOff: 'Loses the softer product work, which may be a real part of the income.',
    },
    {
      name: 'Process-forward',
      description:
        'Alternate finished work with process frames on a fixed rhythm so the grid reads as a method.',
      tradeOff: 'Requires ongoing documentation discipline, which is real work.',
    },
    {
      name: 'Consistent frame',
      description:
        'Keep the subject variety but apply one fixed border, palette and crop ratio across everything.',
      tradeOff: 'Individual pieces lose some impact in service of the whole.',
    },
  ],
  checklist: [
    'Choose one colour treatment and reapply it across the last nine pieces.',
    'Add the client or project name to every cover image.',
    'Break up the three consecutive flat-lays with a different composition.',
    'State the core discipline in the profile description.',
    'Add a visible contact route to the header.',
    'Standardise the crop ratio across all covers.',
    'Retire whichever of the two typographic systems is used less.',
  ],
  revisionBrief:
    'The individual work is strong; the grid is not saying anything as a whole. Pick one colour treatment and one typographic system, apply both across everything, and label the work with client or project names. Say what the studio does in the profile description. The variety of subject matter is an asset — it only reads as inconsistency because nothing frames it.',
  creativeRevisionPrompt:
    'Rework this studio feed for coherence without reducing subject variety. Select one of the two existing colour treatments and reapply it consistently across recent covers. Standardise every cover to a single crop ratio and a single typographic system. Add a client or project label to each cover in a fixed position. Break the run of three identical flat-lay compositions. Keep the range of subject matter — it is a strength once a consistent frame holds it together.',
  assumptions: [
    'The screenshot shows the most recent work rather than a curated selection.',
    'The studio wants client enquiries rather than only an archive.',
  ],
  confidence: 0.66,
}

export const SAMPLE_BRIEF = {
  visualType: 'Instagram post',
  platform: 'Instagram',
  targetAudience: 'Potential customers',
  goal: 'Launch a product',
  desiredImpression: 'Premium',
}
