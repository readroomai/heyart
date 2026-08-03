# HiArt

**Know how your visuals land.**
AI visual perception and creative intelligence — [hiart.eu](https://hiart.eu)

Upload any visual and discover what people notice, feel, trust, misunderstand and remember before
you publish it. HiArt is a second opinion on creative work: it does not replace a designer, it tells
you how a piece is likely to be perceived and gives you a revision plan.

Made by Gia Macool and the HiArt team.

---

## What it does

Three modes, one interaction: upload → set the brief → read the report.

| Mode              | Input                                   | Output                                                                                                                                             |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual Review** | One image                               | Visual Score, attention path, nine scored dimensions, audience reads, five prioritised improvements, revision brief and a copyable creative prompt |
| **A/B Compare**   | Two variants                            | A recommendation, a criterion-by-criterion verdict, the trade-off you accept, and the strongest elements to carry across from each                 |
| **Feed Audit**    | One profile / feed / gallery screenshot | Positioning, consistency scoring, style conflicts, three visual directions, and a seven-item checklist                                             |

Free beta: **3 analyses per user per UTC day**, **3 Brand Profiles**.

---

## Architecture

```
src/
  app/
    page.tsx                     Landing page
    example/                     Bundled example report (no AI call)
    privacy/ terms/ ai-limitations/
    sign-in/ sign-up/            Clerk-hosted flows
    setup/                       Shown when credentials are missing
    r/[slug]/                    Public shared report
    app/                         Authenticated studio
      page.tsx                   Dashboard
      new/ compare/ audit/       The three modes
      analysis/[id]/             Result screen
      brand-profiles/ history/ settings/
    api/
      upload/                    Validated image upload
      analyses/                  Create, list, rename, favourite, delete
      brand-profiles/            CRUD
      share/                     Create and revoke public links
      preview-image/             Local-preview image serving only
  components/
    site/    marketing/    app/    report/
  lib/
    env.ts             Single source for configuration
    options.ts         Every selectable option, shared with prompts and tests
    schemas.ts         Zod contracts for AI output and requests
    prompts.ts         Prompt construction, safety and judgement rules
    ai.ts              Google GenAI client, validation, one corrective retry
    analysis-service.ts  The end-to-end run
    db/                Drizzle schema and connection
    storage.ts         Private Supabase Storage
    usage.ts           Daily limits
    auth.ts            Clerk identity and lazy user upsert
    share.ts           Share slugs and the public allow-list
```

**Stack:** Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Clerk · Supabase Postgres +
Storage · Google GenAI (`@google/genai`) · Zod · Vitest · Playwright.

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable                            | Where to get it                                                     |
| ----------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Your deployed origin, e.g. `https://hiart.eu`                       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API keys                                          |
| `CLERK_SECRET_KEY`                  | Clerk dashboard → API keys                                          |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase → Project Settings → API                                   |
| `SUPABASE_SERVICE_ROLE_KEY`         | Supabase → Project Settings → API → **service_role / secret** key   |
| `SUPABASE_DATABASE_URL`             | Supabase → Project Settings → Database → **Connection pooling** URI |
| `GOOGLE_API_KEY`                    | [aistudio.google.com/apikey](https://aistudio.google.com/apikey)    |
| `GEMINI_MODEL`                      | Defaults to `gemini-3-flash-preview`                                |

> Use the **pooler** connection string, not the direct `db.<ref>.supabase.co` host — the direct host
> is IPv6-only and will time out from most networks.

### 3. Database

```bash
npm run db:migrate
```

This applies `drizzle/0000_init.sql`: six tables, foreign keys, indexes, cascading deletes and row
level security.

### 4. Storage

In the Supabase dashboard, create a **private** bucket named `hiart-uploads`. The migration attempts
this too, but the dashboard is the reliable route. Nothing in the bucket is publicly readable —
images are served through short-lived signed URLs generated on the server.

### 5. Run

```bash
npm run dev
```

---

## Local preview without credentials

The app runs end to end with no cloud accounts, which is how the test suite and the launch
screenshots work:

```bash
npm run seed:preview
HIART_PREVIEW_AUTH=1 npm run dev
```

This uses an in-process PGlite database and filesystem image storage under `.data/`, and signs you
in as a local preview user. It is **development only** — `HIART_PREVIEW_AUTH` is ignored in a
production build. Add `HIART_MOCK_AI=1` to stub the model with the bundled fixtures.

---

## Commands

| Command                | What it does                                           |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Development server                                     |
| `npm run build`        | Production build                                       |
| `npm start`            | Serve the production build                             |
| `npm run typecheck`    | TypeScript, strict                                     |
| `npm run lint`         | ESLint                                                 |
| `npm run format`       | Prettier                                               |
| `npm test`             | Vitest unit tests                                      |
| `npm run test:e2e`     | Playwright flows, desktop and mobile                   |
| `npm run db:migrate`   | Apply the schema to Supabase                           |
| `npm run seed:preview` | Seed the local preview database                        |
| `npm run assets`       | Regenerate logos, favicon and the Open Graph card      |
| `npm run screenshots`  | Capture the Orynth launch screenshots from the real UI |

---

## Testing

**Unit** (`tests/unit`) — AI response schema validation, daily usage windows, file validation,
ownership checks, share-link privacy rules and prompt construction.

**End to end** (`tests/e2e`) — landing page, the public example, app routing, upload, a complete
Visual Review with a mocked model, the report screen, Brand Profile creation, history filtering and
deletion, share-link creation and revocation, and mobile navigation at 390px.

The AI provider is mocked during tests via `HIART_MOCK_AI=1`; the real integration is untouched.

```bash
npm test
npm run test:e2e
```

---

## Deployment

1. Push to your Git remote.
2. Import the repository into Vercel (or any Node host).
3. Add every variable from the table above to the project's environment.
4. Set `NEXT_PUBLIC_APP_URL` to the production origin — share links are built from it.
5. Deploy, then point `hiart.eu` at it.
6. In Clerk, add the production domain to allowed origins and set the paths to `/sign-in` and
   `/sign-up`.

`npm run build` must pass before deploying; it is the same command the host runs.

---

## Troubleshooting

**"Finish the setup" instead of the app** — a required variable is missing. The page lists exactly
which ones.

**`CONNECT_TIMEOUT` on the database** — you are using the direct `db.<ref>.supabase.co` host, which
is IPv6-only. Switch to the pooler URI.

**Reviews fail with "not configured"** — `GOOGLE_API_KEY` is unset.

**"The review came back in an unexpected shape"** — the model returned JSON that failed schema
validation twice. Nothing is saved. Usually a model-compatibility issue: check `GEMINI_MODEL` points
at a current vision model.

**Uploads fail** — confirm the `hiart-uploads` bucket exists, is private, and that
`SUPABASE_SERVICE_ROLE_KEY` is the secret key rather than the publishable one.

**Clerk shows the wrong product name** — that string comes from the Clerk application name in the
dashboard, not from this code.

---

## Privacy and limits

- Uploads go to a private bucket; analyses are private by default.
- Sharing is an explicit action, the image stays hidden unless revealed, and links are revocable.
- Shared reports never expose emails, private context, storage paths or internal prompts.
- Images and prompts are never written to application logs.
- Your visual is processed by an external AI provider (Google Gemini) to produce the review.
- HiArt gives an AI-assisted assessment. It cannot predict engagement, reach or conversion, and it
  will not evaluate people. See `/ai-limitations`.
