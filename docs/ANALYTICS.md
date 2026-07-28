# Life Science Atlas — Analytics and Blueprint Funnel

Client analytics uses PostHog when configured. The commercial Blueprint funnel
also writes privacy-minimal first-party stage receipts so Gate 0 measurement
does not disappear when PostHog is unavailable.

- PostHog snippet: `client/index.html`
- Event helpers: `client/src/hooks/use-analytics.ts`
- First-party contract: `shared/quality-lab-funnel.ts`
- Admin report: Admin control center → Blueprint funnel

## Safety guard

All emits go through `capture()` which checks
`typeof window.posthog?.capture === "function"` before calling. When the key is
unset, `init()` never runs and the stub methods don't exist — the guard makes
those calls no-ops instead of throwing (this previously caused a full blank-page
crash; see commit `111c67b`). **Keep this guard.**

## Blueprint commercial funnel

The first-party endpoint accepts only a strict whitelist. It stores generated
event and journey identifiers, stage, timestamps and limited operational
context such as CTA placement, start mode and offer. It rejects arbitrary
fields and must never receive project identifiers, project inputs, contact
details, product data, evidence text or other confidential content.

Journeys rotate after 24 hours of browser inactivity. The Admin report counts
unique journeys per stage over 30 days and shows reach relative to planner
starts. Direct route entry is allowed, so later-stage reach can exceed CTA reach.

| Stage | Trigger |
|---|---|
| `cta_clicked` | Blueprint CTA from a measured placement |
| `planner_started` | New planner opened |
| `start_mode_selected` | Guided, example, blank or import selected |
| `model_compiled` | Initial model or revision compiled |
| `review_viewed` | Commercial review intake opened |
| `review_started` | Review submission attempted |
| `review_requested` | Review request accepted |
| `diagnostic_checkout_started` | Scope Diagnostic checkout opened |
| `diagnostic_purchased` | Checkout success page observed |

The purchase receipt remains a client-side funnel proxy. Stripe webhook and
purchase records remain authoritative for payment and revenue.

Run `npm run db:push` in the target environment before relying on the report.
If the receipt table is temporarily absent, the API deliberately returns an
accepted/no-record response so analytics cannot break the customer journey.

## General conversion funnel (legacy/supporting)

| Step | Event | Fired from | Properties |
|---|---|---|---|
| 1. Visit | `page_view` | `usePageTracking()` on every route change | `path` |
| 2. Lead | `lead_captured` | LeadMagnetBanner submit success | `source` |
| 3. Checkout | `checkout_started` | PricingPage + GMPAuditKit checkout click (one-time) | `product_type`, `price_usd?` |
| 3'. Subscribe | `subscription_started` | UpgradePage subscribe click | `plan` |
| 4. Convert | `purchase_completed` | PaymentSuccessPage mount (client proxy) | `product_type`, `amount_cents?` |

> `purchase_completed` here is a **client-side proxy** fired on the success
> page. The authoritative record is the Stripe webhook server-side
> (`checkout.session.completed`) — use Stripe/DB for revenue truth; PostHog for
> funnel shape.

## Upgrade prompts (Sprint 6.2)

| Event | Fired from | Properties |
|---|---|---|
| `upgrade_prompt_shown` | FreeReadBanner / UpgradeInlineCTA mount (non-Pro) | `placement` |
| `upgrade_prompt_clicked` | same components, CTA click | `placement` |

`placement` values: `free_read_banner`, `blog_post_end`, `article_end`.

## Other events

| Event | Fired from | Properties |
|---|---|---|
| `pro_modal_opened` | ProModal | `trigger` |
| `lesson_opened` | lesson view | `lesson_id`, `lesson_title` |
| `search_performed` | search inputs | `query`, `section`, `results_count` |
| `workflow_clicked` | workflow cards | `workflow_name` |

## Suggested PostHog funnel

`page_view` → `lead_captured` → (`checkout_started` OR `subscription_started`)
→ `purchase_completed`. Break down by `product_type` / `plan`. Use
`upgrade_prompt_shown` → `upgrade_prompt_clicked` → `subscription_started` to
measure in-app prompt effectiveness.

## Verifying

With `VITE_POSTHOG_KEY` set (build) and PostHog reachable, open the app and
watch PostHog Live Events: navigating fires `page_view`; submitting the lead
banner fires `lead_captured`; clicking a buy/subscribe CTA fires
`checkout_started`/`subscription_started`; the success page fires
`purchase_completed`.
