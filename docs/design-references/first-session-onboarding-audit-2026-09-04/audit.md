# First-session onboarding audit

Date: 2026-09-04

## Scope

Combined UX and accessibility review of the default account-creation entry and the first screen shown after a standard registration. The target outcome is to move a new user into the flagship Quality Lab journey without implying that a guest has an account workspace or restoring the retired learning-first product direction.

## Current-flow evidence

1. `01-register-current.png` — healthy. The account form is focused, uses familiar labels and autofill fields, preserves Terms and Privacy links, and keeps the mobile primary action visible. The broader Blueprint value proposition sits below the form on the narrow viewport, which is acceptable because the user has already chosen account creation.
2. `02-welcome-current.png` — needs correction. A guest can open the route and see `Workspace ready` while the header still offers `Sign In`. The hero image pushes most of the first decision below the mobile fold, and the secondary choices route to a general Blueprint landing page and the learning library rather than the illustrative sample and paid diagnostic.

## Highest-impact findings

- Account state is overstated on a public route. The welcome surface must render only for an authenticated non-admin account; guests should return to registration and administrators to the private control center.
- The first-session choice architecture should match the current commercial model: build a capability model, inspect a synthetic Blueprint, or frame a real project through the $149 Paid Scope Diagnostic.
- Evidence learning remains useful but should stay in the supporting section, not compete with the three activation paths.
- Reducing the mobile hero image height should bring the primary choice into the first viewport without inventing a new visual system or asset.
- Each route choice needs a distinct analytics value so activation evidence can distinguish model, sample and Diagnostic intent.

## Accessibility evidence and limits

The captured welcome screen exposes one level-one heading and descriptive whole-card links in the browser accessibility tree. The registration controls have visible labels. Screenshots do not establish complete keyboard behavior, focus visibility, zoom behavior, screen-reader announcements or authentication-transition timing; those require automated and interaction checks after implementation.

## Bounded implementation decision

Reuse the existing page, editorial image, card pattern and destinations. Add an authenticated route boundary, align the two secondary cards with the existing sample and Diagnostic routes, expose honest price/example qualifiers, reduce only the mobile hero height and add regression coverage. Do not add a new onboarding wizard, role questionnaire, domain selector, CRM, or product surface before real pilot evidence requires it.

## Post-change evidence

1. `03-welcome-authenticated-after.png` — healthy. An authenticated standard account sees an account menu, an honest workspace-ready state and the three strategic starts in priority order. More of the first decision now enters the opening mobile viewport while the existing visual language and source image remain intact.
2. `04-guest-redirect-after.png` — healthy. Opening `/welcome` without an authenticated account resolves to `/register`; the page no longer claims that a guest workspace is ready. The registration form, sign-in alternative and Blueprint-first framing remain available.
3. `05-welcome-before-after-comparison.png` — the before and after captures share the same 644 × 689 viewport. The updated mobile hero preserves the source asset while bringing more of the first activation card above the fixed navigation.
4. The browser accessibility tree exposes one level-one heading and three descriptive whole-card links for the model, synthetic sample and Diagnostic. Automated coverage additionally checks guest routing, the key commercial qualifiers and narrow-viewport horizontal overflow.

## Step health

- Account-state boundary: healthy in local production-mode verification.
- Authenticated first-session choice architecture: healthy in local production-mode verification.
- Registration fallback: healthy in local production-mode verification.
- Production-preview verification: pending branch deployment and CI at the time of this audit.
