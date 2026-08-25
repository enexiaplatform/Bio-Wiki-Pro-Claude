# Commerce Entry Readiness UX Audit — 2026-08-25

## Outcome

Career Blueprint, Paid Scope Diagnostic, GMP Audit Kit, and Pricing now read the same server-owned billing readiness before presenting a payment action or immediate-access promise. When readiness is missing, false, or cannot be confirmed, each surface fails closed and keeps a useful free or service-assisted next step visible.

This supports the current service-assisted Gate 1 direction: Atlas may describe the agreed commercial offer, but it must not imply that self-serve checkout is available when the production runtime cannot support it.

## Evidence captured

Current-run screenshots are stored in [`docs/design-references/commerce-entry-readiness-audit-2026-08-25/`](design-references/commerce-entry-readiness-audit-2026-08-25/).

- Career before: [`09-career-checkout-baseline-desktop.png`](design-references/commerce-entry-readiness-audit-2026-08-25/09-career-checkout-baseline-desktop.png)
- Career after, desktop: [`06-career-checkout-unavailable-fixed-desktop.png`](design-references/commerce-entry-readiness-audit-2026-08-25/06-career-checkout-unavailable-fixed-desktop.png)
- Career after, mobile: [`07-career-checkout-unavailable-fixed-mobile.png`](design-references/commerce-entry-readiness-audit-2026-08-25/07-career-checkout-unavailable-fixed-mobile.png)
- GMP Kit before: [`03-gmp-kit-baseline-desktop.png`](design-references/commerce-entry-readiness-audit-2026-08-25/03-gmp-kit-baseline-desktop.png)
- GMP Kit after, desktop: [`04-gmp-kit-fixed-desktop.png`](design-references/commerce-entry-readiness-audit-2026-08-25/04-gmp-kit-fixed-desktop.png)
- GMP Kit after, mobile: [`05-gmp-kit-fixed-mobile.png`](design-references/commerce-entry-readiness-audit-2026-08-25/05-gmp-kit-fixed-mobile.png)
- Diagnostic request after: [`08-diagnostic-readiness-fixed-desktop.png`](design-references/commerce-entry-readiness-audit-2026-08-25/08-diagnostic-readiness-fixed-desktop.png)

No live form, customer, lead, or payment record was created while capturing this evidence.

## Numbered flow audit

### 1. Billing readiness is resolved once

**Before:** Pricing, Career, and Diagnostic each interpreted commerce state differently. Pricing had a fail-closed check, Career called checkout directly, and Diagnostic used a page-local boolean.

**After:** `useBillingPlans()` parses `/api/billing/plans`, caches the result briefly, and exposes product-specific readiness for Pro monthly/annual, Scope Diagnostic, and Career Blueprint. Unknown response values and request failures resolve to unavailable in the UI.

**Health:** Healthy. Product CTAs cannot infer readiness from price copy or authentication alone.

### 2. Career Snapshot → paid Blueprint

**Before:** Completing the free assessment always displayed “Unlock my personalized Blueprint — $20 one-time” plus “Secure checkout · instant PDF”, even when the server reported `careerBlueprint: false`.

**After:** The result card first checks availability. If checkout is unavailable, the paid button and instant-delivery promise disappear. The card explains the state, preserves the sample PDF, and routes the user into the free proof plan. The checkout handler also has a second fail-closed guard.

**Health:** Healthy. The free output remains useful, and no Stripe request is attempted from the unavailable state.

### 3. GMP Audit Kit → Atlas Pro

**Before:** The hero promised “Unlock with Pro” and “Immediate access” while Pro checkout was offline.

**After:** The page shows a loading state while readiness is checked. When Pro commerce is unavailable, the CTA becomes “View Pro availability,” the immediate-access badge becomes “Free checklist available now,” Stripe-specific trust copy disappears, and the free checklist remains the actionable path.

**Health:** Healthy. The page still explains the Pro value without presenting payment as currently executable.

### 4. Scope Diagnostic request → payment expectation

**Before:** The pre-submit note always said secure checkout would appear as a separate step, including for Blueprint scopes that use an agreed payment schedule and for a runtime with Diagnostic checkout disabled.

**After:** The note is offer- and readiness-aware. A Diagnostic with available checkout explains when checkout appears; an unavailable Diagnostic explains that fit is confirmed first and payment instructions are sent separately; a Blueprint scope explains the agreed schedule and kickoff basis.

**Health:** Healthy. The request form no longer over-promises the next commercial step.

### 5. Captured Diagnostic brief → payment action

**Before:** The post-submit state already hid the direct pay button for an authenticated user when checkout was unavailable, but a guest could still be asked to create an account “to pay securely.”

**After:** Loading, available, and unavailable states are explicit. Account-to-pay and “Pay $149 securely” actions render only when `scopeDiagnostic` is true. Otherwise the user sees a status message that no payment is due from the screen.

**Health:** Healthy. Automated coverage proves zero checkout attempts in the unavailable branch.

## UX and accessibility review

- Loading states use disabled buttons and visible progress labels.
- Unavailable states use `role="status"`; request failures remain `role="alert"`.
- The Career fallback is a real link to the free recommendations section, so keyboard and assistive-technology users retain a concrete next action.
- The 390 × 844 Career and GMP states were visually inspected; the primary message and action remain readable without horizontal overflow.
- Automated smoke coverage exercises both available and unavailable branches for Career, Diagnostic, GMP Kit, and Pricing.

Limitations: this audit did not complete a real authenticated Stripe checkout, webhook, receipt, or fulfillment flow. Browser screenshots do not replace a full screen-reader pass, zoom/reflow audit, or keyboard-only audit across every legacy Pro upsell.

## Residual risks

1. Billing readiness is cached for 60 seconds. A just-disabled server still rejects checkout authoritatively; the UI may take up to one minute to reflect a configuration change.
2. Static price descriptions remain visible while checkout is unavailable because they describe the offer, not an executable payment action. Any future “buy now,” trial, instant-access, or secure-checkout copy must consume the shared readiness hook.
3. Production commerce remains unavailable until the owner-controlled Stripe, database/schema, email, and notification prerequisites are configured and verified.
4. Gate 1 still requires three real paid engagements with controlled delivery, client acceptance, delivery-time evidence, and estimate-to-actual learning.

## Verification target

The regression gate must continue to prove:

- no unavailable Career, Diagnostic, or Pro entry can call `/api/stripe/create-checkout-session`;
- available products retain their existing authentication and checkout handoffs;
- unavailable pages keep a useful free or service-assisted next step;
- mobile layouts remain reachable and readable.
