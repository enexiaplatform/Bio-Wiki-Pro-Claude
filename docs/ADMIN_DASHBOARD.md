# Admin Dashboard

The private control center is available at `/admin`.

## Access

Admin access requires both:

1. a signed-in Atlas account; and
2. its email in the comma-separated `ADMIN_EMAILS` environment variable (or the single-value `ADMIN_EMAIL` fallback).

The server checks the allowlist on every admin API request. Hiding the navigation item is not treated as authorization.

## Operational surfaces

- Overview: registered users, Pro access, purchases, revenue, leads, commercial requests, reviewed Blueprint projects, content and paid-document inventory.
- Users: account status and controlled manual Pro grants/revocations.
- Paid documents: source-controlled deliverable products, access model, file availability and administrator download verification.
- Pipeline: leads, expert-review/commercial requests, purchases and reviewed Blueprint projects.
- Content: production publish status, access tier and sort order stored in `content_entries`.

## Paid-document storage model

Paid files remain under `content/deliverables/<product>/` and are declared in `server/deliverables.ts`. This storage is deployment-safe and keeps access rules version controlled. The dashboard verifies that every declared source exists in the deployed bundle. Admin accounts can download all declared files for release QA.

Adding a new paid product remains a controlled release change: add the source files, register the product and entitlement in `server/deliverables.ts`, validate, then deploy. Browser uploads are intentionally excluded from v1 because a Vercel Function filesystem is ephemeral; future uploads should use an approved object store with malware scanning and an audit log.

## Production setup

Set `ADMIN_EMAILS` in the Vercel Production environment, redeploy, register or sign in with that exact email, and open `/admin`. Never use a shared mailbox password or expose the allowlist in client-side environment variables.
