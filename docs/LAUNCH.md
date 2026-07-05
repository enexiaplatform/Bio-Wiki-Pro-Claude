# Launch — Custom domain & email deliverability

Checklist for going live on a custom domain (e.g. `lifescienceatlas.com`) with
inbox-safe transactional email. DNS records you add at your registrar; this doc
lists exactly which records + which code/config to change.

---

## 1. Point the domain to Vercel

### DNS records (add at your DNS provider)
| Type | Name | Value | Note |
|---|---|---|---|
| A | `@` (apex) | `76.76.21.21` | Vercel apex IP (or use ALIAS/ANAME → `cname.vercel-dns.com` if supported) |
| CNAME | `www` | `cname.vercel-dns.com` | www subdomain |

### In Vercel
1. Project → **Settings → Domains** → add `lifescienceatlas.com` and `www.lifescienceatlas.com`.
2. Set the **primary** domain (e.g. apex). Vercel auto-issues HTTPS.
3. Vercel redirects the other variant to the primary. The old `*.vercel.app`
   stays reachable — to force-redirect it, keep the custom domain primary and
   optionally add a redirect rule; canonical tags (below) already point crawlers
   to the right origin.

### Code / config to update for the new domain
| Where | Change |
|---|---|
| **Vercel env `VITE_SITE_URL`** | `https://lifescienceatlas.com` → drives client canonical/og/hreflang/JSON-LD (`client/src/lib/site.ts`). **Build-time → redeploy.** |
| **Vercel env `BASE_URL`** | `https://lifescienceatlas.com` → server Stripe success/cancel URLs, email links, RSS, content endpoints. Runtime. |
| `client/public/sitemap.xml` | Replace all `https://lifescienceatlas.com` with the new origin (static file — hand edit). |
| `client/public/robots.txt` | Update the `Sitemap:` URL to the new origin. |
| `client/index.html` | Update the static `og:url` / `canonical` placeholder to the new origin. |

> After these: `use-seo.ts`, `Blog.tsx`, `BlogPost.tsx` all read `VITE_SITE_URL`
> automatically — no per-file edits needed for the client.

Verify after deploy: view-source any page → `<link rel="canonical">`, `og:url`,
and `hreflang` use the new domain; `/<domain>/blog/rss.xml` links use it too.

---

## 2. Email deliverability (Resend)

Goal: product-delivery + transactional mail lands in inbox, not spam.

### Verify your sending domain on Resend
1. Resend dashboard → **Domains → Add Domain** → `lifescienceatlas.com` (or a subdomain like `mail.lifescienceatlas.com`).
2. Resend shows records to add. Add them at your DNS provider:

| Type | Name (example) | Value | Purpose |
|---|---|---|---|
| TXT | `send` / domain root | `v=spf1 include:amazonses.com ~all` (as shown by Resend) | **SPF** — authorizes Resend to send |
| CNAME / TXT | `resend._domainkey` (as shown) | DKIM key from Resend | **DKIM** — signs messages |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@lifescienceatlas.com` | **DMARC** — policy + reports (start `p=none`, tighten to `quarantine`/`reject` later) |

3. Wait for Resend to show the domain **Verified**.

### Code / config
| Where | Change |
|---|---|
| **Vercel env `EMAIL_FROM`** | `Life Science Atlas <no-reply@lifescienceatlas.com>` (must be on the verified domain). |
| `server/email.ts` | No code change — `FROM_EMAIL` reads `EMAIL_FROM`. Fallback only used if unset. |

### Sanity checks
- Send a test (e.g. trigger lead magnet) → inspect headers: SPF=pass, DKIM=pass, DMARC=pass.
- Use a tool like mail-tester.com for a spam score.
- Ensure `DOWNLOAD_*` links are real (not placeholder) so delivery emails work — see `docs/ENV_AUDIT.md`.

---

## 3. Post-launch verification
- [ ] Custom domain serves the app over HTTPS; `*.vercel.app` redirects/canonicals to it.
- [ ] Canonical/hreflang/og + sitemap + robots all use the new origin.
- [ ] Stripe success/cancel URLs go to the new domain (`BASE_URL`).
- [ ] Resend domain verified; test email passes SPF/DKIM/DMARC.
- [ ] `npm run build` passes; redeploy after setting `VITE_SITE_URL`.
