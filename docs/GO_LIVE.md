# Go-Live Runbook

The single, ordered checklist to take Life Science Atlas from staging to a revenue-ready
production deployment on Vercel. Sibling docs cover slices in depth:

> **Current state (2026-06-20):** the app is **deployed and healthy** on
> `lifescienceatlas.com` (home/workflows/toolkits/pricing/sitemap all 200,
> `/api/downloads` 401-gated). `/api/billing/plans` returns `{monthly:true, annual:false,
> trialDays:7}`, so a `STRIPE_SECRET_KEY` + `STRIPE_PRO_PRICE_ID` are already set —
> **verify they are LIVE keys, not test**. Remaining owner-only steps to actually take
> money: confirm live Stripe keys, add the **live webhook secret** (Step 2b), set a prod
> `DATABASE_URL` + run `npm run db:push` (Step 1), set `EMAIL_FROM` + `RESEND_API_KEY`,
> and (optional) `VITE_POSTHOG_KEY` + a custom domain. Everything else — 8 gated toolkit
> downloads, 21 workflows, 5 tools, content — is already live in code.

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
                       # quote_requests, content_entries, processed_stripe_events,
                       # lesson_reads (cross-device progress) + the lifecycle-email
                       # tables (lifecycle_sends, checkout_attempts, nurture_sends).
                       # All degrade gracefully if absent, but push them for
                       # cross-device progress + trial/dunning/re-engagement emails.
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
| `pro_subscription` | Life Science Atlas Pro            | subscription | `STRIPE_PRO_PRICE_ID`           |
| `gmp_audit_kit`    | GMP Audit Survival Kit    | payment      | `STRIPE_GMP_AUDIT_KIT_PRICE_ID` |
| `starter_kit`      | Career Starter Kit        | payment      | `STRIPE_STARTER_KIT_PRICE_ID`   |
| `interview_prep`   | Interview Prep Package    | payment      | `STRIPE_INTERVIEW_PREP_PRICE_ID`|
| `bundle`           | Career Accelerator Bundle | payment      | `STRIPE_BUNDLE_PRICE_ID`        |

- [ ] Pro is a **recurring** price; the career kits are **one-time** prices.
- [ ] Copy each **live** Price ID (`price_...`) into the matching Vercel env var.

> **Subscription-first (2026-06-18):** the **GMP Audit Kit is folded into Pro** —
> its page (`/toolkits/gmp-audit-kit`) drives the Pro subscription and is no longer
> sold standalone. You do **not** need `STRIPE_GMP_AUDIT_KIT_PRICE_ID` for launch;
> leave it unset (its standalone checkout simply 400s, and nothing in the UI calls
> it). Pro entitlement unlocks the kit's files via `isProActive`. Keep the row only
> if you ever intend to re-enable a one-time sale; legacy one-time buyers already
> keep access via `entitledBy`. The remaining one-time prices that still matter are
> the **career** kits (`starter_kit`, `interview_prep`, `bundle`).

> **Optional — annual Pro plan (higher LTV):** create a second **recurring (yearly)** price for Pro and set `STRIPE_PRO_ANNUAL_PRICE_ID`. When present, `/upgrade` shows a Monthly/Annual toggle automatically (product id `pro_subscription_annual`); when absent, only monthly shows. No code change needed.

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

> **Quick check:** run **`npm run preflight`** with the target env loaded (it reads
> `.env` via dotenv, or the ambient environment). It reports every required var as
> `✗ blocking` / `! warning` / `✓ ok` for the subscription-first launch — catches the
> commonly-forgotten `STRIPE_WEBHOOK_SECRET`, a `sk_test_` key left in prod, a
> `localhost` `BASE_URL`, or a career-kit price with no download URL. Exit code is
> non-zero while any blocking var is unset. It's a config linter only — still do the
> live test purchase in Step 6 to confirm the webhook + DB end to end.

**Revenue-blocking (must be real, not placeholder):**
- [ ] `DATABASE_URL` — prod Postgres. (Without it, sessions fall back to memory → users get logged out on cold start.)
- [ ] `SESSION_SECRET` — strong random string (fallback is the weak `"default_secret"`).
- [ ] `BASE_URL` — `https://<your-domain>` (drives Stripe success/cancel + email links; fallback is `localhost`).
- [ ] `STRIPE_SECRET_KEY` — live `sk_live_...`.
- [ ] `STRIPE_WEBHOOK_SECRET` — live `whsec_...` from Step 2b.
- [ ] `STRIPE_PRO_PRICE_ID` — live recurring price.
- [ ] `RESEND_API_KEY` — `re_...` (without it, emails are silently skipped).

**For one-time career kits (only if selling them — GMP kit is now Pro-only):**
- [ ] `STRIPE_*_PRICE_ID` (starter_kit, interview_prep, bundle) + `DOWNLOAD_*` URLs (real file links — placeholder = broken delivery email).
- [ ] `DOWNLOAD_GMP_CHECKLIST` — lead-magnet email link (the free pre-audit checklist; separate from any purchase delivery).

**Build-time (`VITE_*`) — changing requires a redeploy:**
- [ ] `VITE_SITE_URL` — `https://<your-domain>` (canonical/og/JSON-LD).
- [ ] `VITE_POSTHOG_KEY` — analytics (optional; app runs fine without).

**Email:**
- [ ] `EMAIL_FROM` — `Life Science Atlas <no-reply@your-domain>` on a Resend-verified domain.

**Google sign-in (optional — the email/password flow works without it):**
- [ ] `GOOGLE_CLIENT_ID` (runtime) and `VITE_GOOGLE_CLIENT_ID` (build-time) — the **same** Google OAuth **Web client ID** (public, not a secret). If unset, the "Continue with Google" button simply doesn't render and the `/api/auth/google` endpoint returns 503.

### Setting up the Google OAuth client
1. Google Cloud Console → **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**.
2. **Authorized JavaScript origins:** add your origins (e.g. `https://lifescienceatlas.com` and your custom domain; add `http://localhost:5000` for local dev).
3. (No redirect URI needed — this uses Google Identity Services ID-token flow, verified server-side.)
4. Copy the **Client ID** into both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` on Vercel, then **redeploy** (VITE_* is build-time).

> Account linking: Google sign-in finds-or-creates the user by their Google-verified email, marks `verifiedEmail=true`, and never sets a password. A user with an existing password account signs into that same account via Google (linked by verified email).

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
9. [ ] As the Pro subscriber, open `/my-downloads` → **all 8 toolkits** are listed
       (GMP Audit Kit, OOS Investigation Template, EM Checklist, BI Workflow Checklist,
       Culture Media Selection Guide, Lab Water Selection Checklist, Data Integrity
       Self-Check, Microbiology QC Starter Pack) and each file downloads — all unlocked
       by Pro, not separate purchases. In a logged-out window `GET /api/downloads`
       returns **401**.
10. [ ] (Only if selling career kits) buy a career kit → `purchases` row written +
        delivery email with the correct `DOWNLOAD_*` link.

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
