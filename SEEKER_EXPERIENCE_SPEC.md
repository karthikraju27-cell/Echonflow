# Echonflow — seeker-side gaps, verified against the real repo

**Second correction, same day.** The prior version was built from Karthik's summary of the live site's behavior — accurate about what pages exist, but it couldn't see what's actually running behind them. Now checked directly against the connected repo (`C:\Users\karth\OneDrive\Echonflow - app`, Next.js + Supabase). Two things changed materially:

1. The ERA is running **placeholder question content**, not the real audit — flagged in the code itself (`TODO(era)`, 3 places), so this isn't news to whoever's building it, but it's more important than "needs matching wired up" suggested.
2. The results screen currently shows **only a raw percentage** — no band, no recommendations, no retreat-interest branch exist at all yet, client or server side.

Everything below is grounded in the actual files, not inference.

## What's real (confirmed in code, unchanged from before)

Auth (Supabase Auth, password + magic link, role-based routing), the provider dashboard, the directory (reads `listings`), retreat/lead capture, all 116 real chapters (`modules-data.json`, migrated from the old prototype build) with a working quiz + certificate system (`module_quiz_progress`, `certificates` tables, RLS'd), and Vārtā's "Add entry" (real, open-submission by design per migration `0003_varta_open_submission` — any signed-in user can post, no moderation gate, and that was a deliberate call already made, not a gap).

## The eight real gaps, in priority order

### 1. ToS/Privacy consent checkbox on sign-up
Confirmed absent in `src/components/auth/AuthForm.tsx` — no checkbox, no link, on either sign-in or sign-up. Fastest fix, still the most urgent live-compliance item.

### 2. The ERA is placeholder content wearing the real product's UI
`src/lib/era-questions.ts` ships a 15-question, 5-section stand-in (Sleep / Stress Load / Movement / Nutrition / Recovery Environment, 3 questions each, 1–5 scale) — not the real, already-written 12-question ERA (`cognitive` / `somatic` / `circadian` / `culture` / `environment`, with real scoring bands and content recommendations) sitting in `seed-data/era.json`. The flow, persistence, and scoring plumbing in `EraFlow.tsx` all work end to end — this is a **content swap**, not a rebuild — but it's the single biggest gap on the seeker side, because it means the platform's actual differentiator is currently fake.

The results screen (`EraFlow.tsx`, `results` stage) makes this sharper: it renders one number (`{score}` — a 0–100 percentage) and a "Retake audit" button. No band (Resilient/Stable/Strained/Depleted), no per-section breakdown, no content recommendations linking into the modules, no retreat-interest branch. All of that scoring/recommendation logic already exists, tested, in the old prototype (`eraSectionScores`, `eraBandFor`, `eraBuildRecommendations`, `eraRetreatInterest`) — it needs porting into this results stage, not designing from scratch.

Schema note: `era_responses` currently stores one `score integer` — no per-section breakdown. Add a `section_scores jsonb` column alongside the content swap, since gap #3 depends on knowing which sections were weak, not just the overall number.

### 3. Provider matching by weak audit section
Sequenced after #2 deliberately — matching depends on real per-section scores existing, which they don't yet. Once #2 ships: add `listings.era_section_tags` (confirmed absent from the `listings` table — currently just `business_name`, `category`, `location`, `description`, `price_range`), tag providers against the same 5 real section IDs, and have the results screen link into a directory pre-filtered toward the seeker's weakest sections — full-directory fallback if a filtered view is empty.

### 4. Anonymous audit-taking
Still true, still a real product decision rather than a default: `EraFlow` requires a `seekerId` prop, so the audit is login-gated today. Recommendation unchanged — open it up, gate account creation at results instead — since the GTM plan's audit-as-lead-magnet tactic depends on pre-signup access.

### 5. WRS™ is also placeholder content (new finding)
`src/lib/wrs-questions.ts` carries the same pattern as the ERA: `TODO(wrs): placeholder question set and equal-weighting methodology` and `TODO(wrs): placeholder tier cutoffs`. This score is shown directly to seekers on resort listing cards (`WRS™ {score} · {tier}` in `ListingCard.tsx`) as if it were an authoritative trust signal. Smaller blast radius than the ERA since it only affects the Resort category, but worth a decision: either fast-track the real methodology, or label it provisional in the UI until it's real — showing a placeholder score as a trust score is the same risk as the ERA issue, just narrower.

### 6. Lead status pipeline
Confirmed: the `leads` table (renamed from `retreat_leads` in migration `0005_provider_hub_and_leads_crm`) has no status column. Add `new` / `contacted` / `booked` (or similar) — cheap now, and it's the data that eventually proves the matching loop drives real bookings.

### 7. Transactional / retention email
Confirmed: `package.json` has no email-sending dependency at all yet (no Resend, no Postmark, nothing). Results email, lead notifications, and a re-audit nudge all still need the sending infrastructure built, not just wired — this is a bigger first step than "add a template," it's "add the service."

### 8. Save/resume + surfaced retake history
Confirmed: `EraFlow` holds answers in React state only — closing the tab loses progress, no `localStorage` recovery. Retakes do insert a fresh `era_responses` row each time (so history isn't literally lost), but nothing marks which row is current or shows a seeker their past results — there's no history view anywhere in the UI. Lowest priority of the eight; polish, not a broken promise.

## What this changes about the build order

Do #2 before #3 — the earlier version of this doc had them the other way, which would mean building provider-matching logic against section IDs that don't match what's actually stored in the database yet (`sleep`/`stress`/`movement`/`nutrition`/`recovery_env` today, not `cognitive`/`somatic`/`circadian`/`culture`/`environment`). Swapping the content first avoids building the matching layer twice.

---

*Verified directly against the connected repo, not inferred from the live site's behavior or a summary of it. File references above are exact — anyone picking this up (Claude Code included) can jump straight to the named files.*
