# Echonflow

Next.js (App Router, TypeScript) + Tailwind + Supabase. Two-sided wellness platform: providers list their practice, seekers learn/get assessed/find providers.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript, React 19
- **Styling**: Tailwind CSS with the Echonflow design tokens (`tailwind.config.ts`)
- **Auth + DB**: Supabase (Postgres, Auth, Row Level Security)
- **Deploy**: Vercel

## 1. Local setup

```bash
npm install
```

Create `.env.local` (copy `.env.local.example`) and fill in your Supabase project's values from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```bash
npm run dev
```

The app will not render past the proxy (`src/proxy.ts`) without valid Supabase env vars — every request checks the session, so this fails loudly rather than silently.

## 2. Supabase project setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`. This creates the `profiles`, `listings`, `varta_posts`, `era_responses`, `retreat_leads` tables, the enums, the `handle_new_user` trigger (auto-creates a `profiles` row on sign-up), and all Row Level Security policies.
3. Optionally run `supabase/seed.sql` for a few sample Vārtā entries so that page isn't empty on first load.
4. In **Authentication → URL Configuration**, set the Site URL and add `http://localhost:3000/auth/callback` (and your production `https://echonflow.com/auth/callback`) as a redirect URL — required for email confirmation and magic links to work.
5. Email confirmation is on by default in Supabase; decide whether to keep it (recommended) or disable it for faster local testing.

If you ever change the schema, regenerate types with:

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

## 3. What's real vs. stubbed

| Area | Status |
|---|---|
| Auth (sign up/in, password + magic link, role-based routing) | Real — Supabase Auth |
| Provider dashboard (create/list listings) | Real — writes to `listings`, RLS-scoped to owner |
| Seeker directory (browse/filter listings) | Real — reads `listings` |
| Retreats lead capture | Real — writes to `retreat_leads` |
| ERA (Energy & Resilience Audit) | **Partially real.** Flow, scoring, and persistence to `era_responses` work end-to-end, but the 15-question set in `src/lib/era-questions.ts` is a placeholder — swap in the real content when you have it (see `TODO(era)` comments). |
| Vārtā (reels & insights) | **Partially real.** Reading/browsing/filtering/Instagram embeds are real (reads `varta_posts`). "Add entry" is an inert stub (`src/components/varta/AddEntryStub.tsx`) pending a decision on open vs. curator-only submission — admin moderation is an explicit fast-follow per the brief. |
| Learning Modules | **Stub.** Lists the 13 module titles only (`src/lib/constants.ts`); no chapter content yet (`src/app/seeker/modules/page.tsx`). |

Search the codebase for `TODO(` to find every flagged stand-in.

## 4. Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket, then import it in the [Vercel dashboard](https://vercel.com/new) — or run `npx vercel` from this directory.
2. In the Vercel project's **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview).
3. Deploy.

### Connecting echonflow.com and echonflow.in

In the Vercel project, go to **Settings → Domains** and add both `echonflow.com` and `echonflow.in`. Vercel will show the exact records for your setup, but for a standard apex + redirect configuration they are:

**echonflow.com (canonical, apex domain)**

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

**echonflow.in (redirects to echonflow.com)**

Add `echonflow.in` as a domain on the same Vercel project and set it to redirect to `echonflow.com` (Vercel's domain settings has a "Redirect to" option — pick 308/301 permanent). Then at your registrar for `echonflow.in`:

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Add these at whichever registrar holds each domain. Propagation can take up to 24–48 hours; Vercel's dashboard will show a green check once each domain verifies and SSL is issued.

Vercel occasionally updates the apex A record IP — always double-check the exact value shown in your project's **Settings → Domains** panel before adding it at the registrar, since that page reflects your specific project/account state.

## 5. Still needed for full PWA install-ability

`public/manifest.webmanifest` has no `icons` array yet — add 192×192 and 512×512 PNG app icons to `public/icons/` and reference them in the manifest once the real Echonflow mark/logo is ready.

## 6. Out of scope (this pass)

- Payments (Razorpay) — once the marketplace has real listings
- Native mobile app — the web app is responsive/PWA-friendly (`public/manifest.webmanifest`) so it can wrap into a mobile shell later
- Admin moderation tooling for listings/Vārtā — fast-follow
