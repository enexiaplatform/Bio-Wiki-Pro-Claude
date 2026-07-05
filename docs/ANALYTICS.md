# Life Science Atlas — Analytics Events (PostHog)

> Client analytics via PostHog. Snippet in `client/index.html`; helpers in
> `client/src/hooks/use-analytics.ts`. Needs `VITE_POSTHOG_KEY` set at **build
> time** on Vercel (VITE_* is inlined — redeploy after changing).

## Safety guard

All emits go through `capture()` which checks
`typeof window.posthog?.capture === "function"` before calling. When the key is
unset, `init()` never runs and the stub methods don't exist — the guard makes
those calls no-ops instead of throwing (this previously caused a full blank-page
crash; see commit `111c67b`). **Keep this guard.**

## Conversion funnel (4 steps)

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
