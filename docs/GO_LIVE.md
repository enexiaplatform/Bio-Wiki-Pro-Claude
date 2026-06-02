# Go-Live Runbook

The single, ordered checklist to take BioWikiPro from staging to a revenue-ready
production deployment on Vercel. Sibling docs cover slices in depth:

- **`docs/ENV_AUDIT.md`** — every env var, where it's read, what breaks if unset.
- **`docs/STRIPE_TEST.md`** — exercising the one-time + checkout flow in Stripe **test mode**.
- **`docs/LAUNCH.md`** — custom domain + email deliverability (DNS/SPF/DKIM/DMARC).

> **The revenue-critical path:** `register/login → /upgrade → Stripe Checkout →
> webhook (checkout.session.completed + subscription.* + invoice.*) → DB columns
> updated → isProActive() unlocks gated content`. Every step below exists to make
> that loop work in live mode. Entitlement is enforced **lazily at read time** by
> `server/entitlements.ts` (`isProActive`) — no cron needed.

---

## Step 0 — Prerequisites

- [ ] Vercel project connected to `main` (auto-deploys on push — confirmed working).
- [ ] A production **PostgreSQL** database (e.g. Neon/Supabase/RDS) and its `DATABASE_URL`.
- [ ] A **Stripe** account, switched to **live mode** for the steps below.
- [ ] A **Resend** account (for transactional + product-delivery email).
- [ ] (Optional but recommended) a **custom domain**.

---

## Step 1 — Database

Drizzle uses **schema-push** (no migration files).

```bash
# With the production DATABASE_URL in your environment:
npm run db:push        # creates/updates: users, sessions, purchases, leads,
                       # quote_requests, content_entries, processed_stripe_events
```

- [ ] `db:push` completes without error against the prod DB.
- [ ] (Optional) `npm run seed:content` — syncs MDX frontmatter → `content_entries`
      for operational state (publish flags, view counts). **Not required**: the
      content endpoint defaults to *published* when a row is missing, so all
      lessons serve even unseeded. Seed if you want to unpublish/sort/track views.

---

## Step 2 — Stripe (live mode)

### 2a. Products & Prices

Create one Price per product (Stripe Dashboard → **live mode** → Products). The
catalog is defined once in `server/products.ts`:

| productType        | Name                      | Mode         | Price env var                   |
|--------------------|---------------------------|--------------|---------------------------------|
| `pro_subscription` | BioWikiPro Pro            | subscription | `STRIPE_PRO_PRICE_ID`           |
| `gmp_audit_kit`    | GMP Audit Survival Kit    | payment      | `STRIPE_GMP_AUDIT_KIT_PRICE_ID` |
| `starter_kit`      | Career Starter Kit        | payment      | `STRIPE_STARTER_KIT_PRICE_ID`   |
| `interview_prep`   | Interview Prep Package    | payment      | `STRIPE_INTERVIEW_PREP_PRICE_ID`|
| `bundle`           | Career Accelerator Bundle | payment      | `STRIPE_BUNDLE_PRICE_ID`        |

- [ ] Pro is a **recurring** price; the four kits are **one-time** prices.
- [ ] Copy each **live** Price ID (`price_...`) into the matching Vercel env var.

> Only ship what you sell: if a kit isn't launching yet, you can omit its price —
> its checkout simply returns `400 Invalid productType` until configured. Pro is
> the primary revenue product and **must** be set.

### 2b. Webhook endpoint + events  ⚠️ critical

Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- **Endpoint URL:** `https://<your-domain>/api/stripe/webhook`
- **Subscribe to these 6 events** — the handler in `server/routes.ts` acts on each;
  missing one silently breaks part of the lifecycle:

| Event | What the app does |
|---|---|
| `checkout.session.completed` | Unlock Pro (subscription) or record a purchase + send delivery email (one-time) |
| `customer.subscription.created` | Store subscription id + period end |
| `customer.subscription.updated` | Track status, set `proExpiresAt`, keep Pro during `past_due` |
| `customer.subscription.deleted` | Revoke Pro (`isPro=false`, status `canceled`) |
| `invoice.payment_failed` | Start a **3-day dunning grace**, keep Pro, email the customer |
| `invoice.payment_succeeded` | Clear grace, restore Pro, extend `proExpiresAt` |

- [ ] Endpoint created with **all 6** events (not just `checkout.session.completed`).
- [ ] Copy the endpoint's **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.
      This is the **production** secret — different from the `stripe listen` secret
      used in test mode.

> Idempotency is built in: each `event.id` is recorded in `processed_stripe_events`
> after successful fulfillment, so Stripe retries never double-charge entitlement.

---

## Step 3 — Environment variables (Vercel → Settings → Environment Variables)

Set all of these for **Production**. Full annotations in `docs/ENV_AUDIT.md`.

**Revenue-blocking (must be real, not placeholder):**
- [ ] `DATABASE_URL` — prod Postgres. (Without it, sessions fall back to memory → users get logged out on cold start.)
- [ ] `SESSION_SECRET` — strong random string (fallback is the weak `"default_secret"`).
- [ ] `BASE_URL` — `https://<your-domain>` (drives Stripe success/cancel + email links; fallback is `localhost`).
- [ ] `STRIPE_SECRET_KEY` — live `sk_live_...`.
- [ ] `STRIPE_WEBHOOK_SECRET` — live `whsec_...` from Step 2b.
- [ ] `STRIPE_PRO_PRICE_ID` — live recurring price.
- [ ] `RESEND_API_KEY` — `re_...` (without it, emails are silently skipped).

**For one-time kits (only if selling them):**
- [ ] `STRIPE_*_PRICE_ID` (the four kits) + `DOWNLOAD_*` URLs (real file links — placeholder = broken delivery email).
- [ ] `DOWNLOAD_GMP_CHECKLIST` — lead-magnet email link (separate from purchase delivery).

**Build-time (`VITE_*`) — changing requires a redeploy:**
- [ ] `VITE_SITE_URL` — `https://<your-domain>` (canonical/og/JSON-LD).
- [ ] `VITE_POSTHOG_KEY` — analytics (optional; app runs fine without).

**Email:**
- [ ] `EMAIL_FROM` — `BioWikiPro <no-reply@your-domain>` on a Resend-verified domain.

---

## Step 4 — Domain & email deliverability

Follow **`docs/LAUNCH.md`** end-to-end:
- [ ] Domain points to Vercel; HTTPS issued; `*.vercel.app` canonicals to it.
- [ ] Resend sending domain **Verified** (SPF + DKIM + DMARC).
- [ ] `client/public/sitemap.xml`, `robots.txt`, `index.html` placeholders updated to the new origin.

> Note: the **dynamic** `/sitemap.xml` (server route) already emits the live
> content URLs from `BASE_URL`; the static file in `client/public` is the fallback.

---

## Step 5 — Deploy

- [ ] `npm run check` and `npm run build` pass locally.
- [ ] Push to `main` (or redeploy in Vercel). **Redeploy is mandatory after changing any `VITE_*`** (inlined at build time).
- [ ] Vercel deployment state = **READY**.

---

## Step 6 — Production smoke test

Do this once on the live site (you can use a real card and immediately cancel/refund, or keep Stripe in test mode for a dry run first).

1. [ ] Register a fresh account → confirm welcome email arrives (Resend).
2. [ ] Visit `/upgrade` → "What's inside Pro" lists the Pro lessons → click **Upgrade**.
3. [ ] Complete Stripe Checkout → redirected to `/payment/success`.
4. [ ] Stripe Dashboard → Webhooks → the endpoint shows `checkout.session.completed`
       and `customer.subscription.created/updated` delivered with **HTTP 200**.
5. [ ] `GET /api/auth/me` returns `"isPro": true`.
6. [ ] Open a **Pro** lesson (e.g. `/library/computer-system-validation`) → full body
       renders (no paywall). In an incognito/logged-out window the same lesson returns
       `{ locked: true }` with **no body** (gating not leaking).
7. [ ] Settings → **Manage subscription** opens the Stripe billing portal.
8. [ ] Cancel in the portal → after `customer.subscription.deleted`, `isPro` flips to
       `false` and the Pro lesson re-locks.
9. [ ] (One-time, if selling kits) buy the GMP kit → `purchases` row written + delivery
       email with the correct `DOWNLOAD_*` link.

Quick DB sanity:
```sql
SELECT email, is_pro, subscription_status, pro_expires_at FROM users ORDER BY created_at DESC LIMIT 5;
SELECT event_type, created_at FROM processed_stripe_events ORDER BY created_at DESC LIMIT 10;
```

---

## Step 7 — Monitoring & rollback

- [ ] Watch Vercel **Runtime Logs** for `Webhook handler error` / `signature verification failed`.
- [ ] Stripe **Webhooks** view shows the live endpoint at ~100% success; investigate any 4xx/5xx.
- [ ] **Rollback:** Vercel → Deployments → promote the previous READY build (instant).
      Env/Stripe/DB are runtime, so a rollback doesn't require re-pushing code.

---

## Entitlement model (reference)

`isProActive(user)` is the single source of truth (used by `/api/auth/me` and content gating):
- Requires `isPro = true`, **and**
- not past `proExpiresAt` (handles "cancel → access until period end"), **and**
- if `subscriptionStatus = past_due`, not past `proGraceUntil` (the 3-day dunning grace).

The webhook keeps those columns current; nothing is enforced on a schedule.
