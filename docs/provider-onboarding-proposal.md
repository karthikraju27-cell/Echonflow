# Provider onboarding: review proposal
Status: interactive local preview, not approved for live integration.
Layer: 2 — Providers.

## Journey to approve
Existing provider signup/sign-in → choose service or property → introduce practice → first offering and onboarding contact → review → explicit publish → provider hub.
Resort listings offer a separate WRS assessment after publishing. No automatic score or verification badge.
Preview bypasses login only for local design review and returns notFound in production.

## Data integration after approval
Existing listing fields cover category, name, location, description and price. Contact name/email/phone need an explicit privacy and notification mapping; do not overwrite account identity with business contact data.
Offering title, audience, format and qualifications/facilities have no dedicated columns today. Preserve them as structured fields through a reviewed migration, rather than silently dropping them.
Keep account role protections, owner-only edits, existing inquiries and public provider profiles.
Draft storage in this preview is browser-local and explicit. Production drafts should be account-scoped.
Validate again server-side; prevent duplicate publication; retain draft on failure; display the published profile link after success.
Seek explicit migration approval before any live schema change.

## Proposed launch boundary
No payment collection, commission promise, automated credential verification, or guaranteed bookings.
Provider details are self-reported. WRS remains provisional.
Provider enrollment and listing publication are separate from ERA scoring.
No provider invitation messages have been sent.

## Review
Try both paths, optional pricing, back/edit navigation, and review.
Final approval should cover the field set and explicit self-publication flow before linking from Layer 2.
