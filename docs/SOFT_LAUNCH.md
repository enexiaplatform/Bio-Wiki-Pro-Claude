# Soft-Launch Kit — BioWikiPro

Ready-to-use assets for the 3-round soft launch (Phase 12). Copy/paste and edit
the bracketed bits. Replace `https://bio-wiki-pro-claude.vercel.app` with the
custom domain once it's live.

---

## 1. Three-round plan

| Round | Audience | Goal | Offer |
|---|---|---|---|
| **1 — Private QA** | 3–5 lab/pharma contacts | Do they get it? Is it trustworthy? | Free Pro, ask for blunt feedback |
| **2 — Expert review** | 1–2 senior GMP/QC people | Check technical claims + toolkit usefulness | Free Pro + GMP kit |
| **3 — Public beta** | LinkedIn + QC/QA communities | First real signups & conversions | Free 7-day Pro for the first 50 |

Success signals for round 3: 50 signups · 10 active trials · 3–5 paid (or strong
feedback) · 5 quotable testimonials.

---

## 2. LinkedIn launch post — variant A (story / problem-led)

> After years in QC/QA, I kept seeing the same thing: smart analysts stuck at
> "Senior" because GMP knowledge lived in scattered SOPs and tribal memory — and
> audit season meant stress, not confidence.
>
> So I built **BioWikiPro** — a structured QC/QA learning platform for Pharma &
> Life Science:
>
> • 78 in-depth lessons across 7 learning paths (GMP, sterility, validation,
>   data integrity, Annex 1…)
> • Practical audit-prep tools + a GMP Audit Survival Kit (checklists, CAPA
>   templates, 50+ auditor Q&A)
> • A real QC → QA Manager career roadmap
>
> Dozens of lessons are **free** — no credit card. I'd genuinely value feedback
> from people in the field.
>
> 👉 [https://bio-wiki-pro-claude.vercel.app]
>
> First 50 readers get a free 7-day Pro pass. What would you want to see in a
> tool like this? 👇
>
> #Pharma #GMP #QualityControl #QualityAssurance #LifeSciences #Biotech

## LinkedIn launch post — variant B (short / direct)

> New: **BioWikiPro** — structured GMP / QC / QA learning + audit-prep tools for
> Pharma & Life Science professionals.
>
> 78 lessons · 7 learning paths · a GMP Audit Survival Kit · a QC→QA career
> roadmap. Free to start, no credit card.
>
> Built for the people who actually run the lab. Free 7-day Pro for the first 50.
> Feedback very welcome.
>
> 👉 [https://bio-wiki-pro-claude.vercel.app]
>
> #GMP #QualityControl #Pharma #Biotech #LifeSciences

## 3. Direct-invite DM / email (rounds 1–2)

> Hi [name] — I built a QC/QA learning + audit-prep platform for Pharma/Life
> Science and I'd really value your eye on it given your [GMP/QC/aseptic]
> experience. It's English, global, and most of the Academy is free.
>
> Could you spend ~15 min and tell me: (1) is it clear what it's for, (2) does
> the content read as trustworthy, (3) would the GMP Audit Kit be useful to your
> team? I'll set you up with free Pro. Link: [URL]. Thank you!

---

## 4. Feedback form (paste into Google Forms / Tally / Typeform)

**Title:** BioWikiPro — early feedback (5 min)

1. What's your role? *(short text)*
2. In one line, what do you think BioWikiPro is for? *(short text — tests the
   5-second clarity)*
3. How clear was it what the product does? *(1–5)*
4. How trustworthy did the content feel? *(1–5)*
5. Which part was most useful? *(Academy lessons / Learning paths / GMP Audit
   Kit / Career roadmap / Tools / Other)*
6. Did anything feel inaccurate or overclaimed? *(long text)*
7. Would the **GMP Audit Survival Kit ($59)** be useful to you or your team?
   *(Yes / Maybe / No + why)*
8. Does the pricing feel fair? *(Too low / About right / Too high)*
9. What's the ONE thing you'd add or fix first? *(long text)*
10. Can we quote your feedback as a testimonial? *(Yes + name/title / Anonymous /
    No)*
11. Email if you'd like a reply *(optional)*

> Keep it to one screen. Questions 2, 6, and 9 are the highest-signal — read
> those first.

---

## 5. Pre-launch checklist (do before posting publicly)

- [ ] Operational go-live done (Stripe live keys, `db:push`, one test purchase) — see [GO_LIVE.md](GO_LIVE.md).
- [ ] `VITE_POSTHOG_KEY` set + redeployed (so signups/funnel are tracked).
- [ ] Register a fresh account end-to-end on prod; confirm welcome email.
- [ ] Feedback form live; link added to the LinkedIn post + a pinned comment.
- [ ] Decide how the "first 50 free Pro" is granted (coupon / manual `toggle-pro` / trial) and write the steps down.
- [ ] Skim the live site on mobile once (hero CTA, signup, a lesson, pricing).
