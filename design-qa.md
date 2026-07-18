# Homepage light/dark hierarchy — Design QA

## Source visual truth

- Supplied desktop screenshot: `tmp/design-audit/homepage-depth-2026-07-18/01-homepage-current.png`
- Approved design direction: preserve the dark navy flagship hero, add white/off-white explanatory and deliverable surfaces, retain dark monetization and evidence surfaces, and finish on a light CTA.
- Full-view comparison: `tmp/design-qa/homepage-light-dark/13-source-vs-implementation.png`

## Implementation evidence

- Matched desktop viewport: `tmp/design-qa/homepage-light-dark/12-desktop-1900x900.png`
- Stable desktop first fold: `tmp/design-qa/homepage-light-dark/03-desktop-stable.png`
- Desktop monetized products: `tmp/design-qa/homepage-light-dark/08-desktop-products.png`
- Desktop deliverables transition: `tmp/design-qa/homepage-light-dark/09-desktop-deliverables.png`
- Desktop final CTA: `tmp/design-qa/homepage-light-dark/10-desktop-final-cta.png`
- Mobile first fold: `tmp/design-qa/homepage-light-dark/05-mobile.png`
- Mobile light process section: `tmp/design-qa/homepage-light-dark/06-mobile-how-it-works.png`

## Viewports and state

- Desktop comparison: supplied 1900 × 909 source normalized beside a browser-rendered 1892 × 896 implementation.
- Desktop inspection: 1432 × 1024 and 1272 × 720, public homepage, signed-out state.
- Mobile inspection: 382 × 844 content viewport, public homepage, signed-out state.
- Primary conversion paths remained present: free Quality Lab model, $149 diagnostic, Blueprint from $990, Atlas Pro, and $20 Career Blueprint.
- Console errors on a clean browser tab: none.
- Horizontal overflow: none on inspected desktop and mobile viewports.

## Findings

No actionable P0, P1, or P2 findings remain.

- Typography: Inter/Space Grotesk hierarchy, headline wrapping, weights, and line heights remain consistent with the source. Light-surface headings now use explicit slate-950 tokens so global heading styles cannot reduce contrast.
- Spacing and layout rhythm: hero proportions and CTA order remain intact. The white trust band, off-white process section, dark product section, white deliverables section, dark evidence section, and off-white final CTA create the approved visual rhythm without changing information architecture.
- Colors and visual tokens: dark canvas `#061426`, raised dark surface `#081A2D`, white, and off-white `#F4F7F5` are used intentionally. Light-surface copy uses slate-600 and dark teal instead of bright teal to preserve contrast.
- Image quality: the existing real raster Blueprint delivery asset remains sharp, correctly scaled, and is now anchored by a raised navy panel. No placeholder, CSS art, or handcrafted SVG substitute was introduced.
- Copy and content: all commercial copy, prices, trust boundaries, and product distinctions remain unchanged.
- Icons: existing Lucide icons remain aligned and legible on both light and dark surfaces.
- Responsiveness: mobile preserves the original conversion-first first fold; light surfaces reflow into a single-column sequence with no clipping or horizontal scroll.

## Focused region comparison

Focused captures were required because the first-fold comparison cannot show the full color rhythm. Product cards, deliverables, final CTA, and mobile process states were inspected separately in the implementation evidence listed above.

## Comparison history

### Iteration 1

- [P2] Light-section headings inherited the global white heading color, making the process and deliverable titles unreadable on white/off-white backgrounds.
- Fix: added explicit `text-slate-950` classes to every heading in light sections.
- Post-fix evidence: `02-desktop-fixed.png`, `03-desktop-stable.png`, `06-mobile-how-it-works.png`, and `09-desktop-deliverables.png` show dark, readable headings.

### Iteration 2

- No new P0/P1/P2 findings.
- Clean-tab browser verification reported no console errors and no horizontal overflow.

## Follow-up polish

- [P3] The raised panel around the Blueprint documents is a deliberate departure from the flatter source screenshot. It improves asset anchoring and section depth, matching the user's approved direction.
- Full-page stitched screenshots from the in-app browser repeated fixed content, so QA relies on stable viewport and focused section captures instead of that unreliable artifact.

## Implementation checklist

- [x] Preserve the dark flagship hero and all conversion CTAs.
- [x] Add white/off-white trust, process, deliverables, and final CTA surfaces.
- [x] Keep all monetized products together on a dark commercial surface.
- [x] Keep Atlas Evidence on a supporting dark surface.
- [x] Verify desktop and mobile contrast, overflow, asset quality, and clean console state.

## Initial-model visualization enhancement

- Reference: the user-supplied model-preview screenshot showing capability coverage, analyst workload, equipment fit, and open questions.
- Design decision: adopt the reference's analytical structure, but place it inside the existing off-white process section rather than duplicating the commercial ladder already represented elsewhere on the homepage.
- Desktop: verified at a 1432 px content viewport. The preview reads as one controlled output panel with four clearly divided analytical jobs and no horizontal overflow.
- Mobile: verified at a 382 px content viewport. The intro and four outputs stack into a linear reading path; chart values and labels remain visible without hover.
- Data integrity: every value is explicitly labeled as an illustrative initial concept that changes with user inputs and requires site verification. The display makes no customer-result or benchmark claim.
- Accessibility: charts have descriptive image labels, direct visible values, text legends, and non-color status labels. Recharts owns geometry while React owns copy and layout; animations are disabled.
- Visual comparison: the implementation preserves the reference's white analytical surface, teal/amber/coral semantic palette, donut composition chart, workload comparison, gap summary, and prioritized questions while matching the Atlas light/dark hierarchy.
- Browser inspection: no horizontal overflow at desktop or mobile widths; the model preview, all paid product paths, and adjacent section transitions remain intact.

final result: passed
