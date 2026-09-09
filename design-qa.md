# Methods Navigator Design QA

## Comparison target

- Source visual truth: `docs/design-references/methods-enterprise-evidence-dossier-v2.png`
- Route: `/methods`
- State: desktop, dark theme, guest, default query `microbial method suitability`, selected application `Microbial method suitability and recovery`
- Target and implementation viewport: 1487 × 1058 CSS pixels at device pixel ratio 1
- Implementation evidence: `docs/design-references/methods-premium-redesign-audit/02-enterprise-desktop-1487x1058.png`
- Mobile evidence: `docs/design-references/methods-premium-redesign-audit/05-mobile-viewport-390x844.png` and `06-mobile-full-flow.png`

## Audit steps

1. **Default desktop dossier — healthy.** The query, five-stage evidence route, eight bounded applications, selected application, named sources, evidence boundary, decision-use controls, metrics, and trust note render in one coherent view.
2. **Application selection — healthy.** Selecting Environmental monitoring updates the query, selected record, domain, sources, evidence boundary, coverage status, and action context together. Evidence: `03-environmental-monitoring-selected.png`.
3. **Unsupported query — healthy after fix.** `impossible-unmapped-method-xyz` produces an explicit `Not yet covered` state, removes the stale active application highlight, asserts no source without a match, and builds a scoped-review URL containing the query. Evidence: `04-not-covered-desktop.png`.
4. **Mobile reflow — healthy.** At 390 × 844 the route becomes a readable vertical sequence, all eight application controls remain reachable, and the document width stays within the viewport. Evidence: `05-mobile-viewport-390x844.png` and `06-mobile-full-flow.png`.

## Findings

- No actionable P0, P1, or P2 visual differences remain against the selected source.
- Fixed a logic/UX defect found during the audit: after an unsupported search, the previously selected application remained visually active even though the result panel correctly said no bounded record existed.
- Accepted P3 differences: the implementation keeps the existing 64 px Atlas navigation, slightly tighter global type scale, canonical full application title, and the product's current mobile shell. These preserve the established design system and do not weaken the source hierarchy.

## Fidelity surfaces

- **Typography:** Inter and Space Grotesk, headline wrapping, all-caps section labels, body scale, status hierarchy, and numeric metrics follow the source.
- **Layout:** the desktop three-column dossier, five-stage trace, active-row treatment, source rows, paired actions, and trust footer align with the source composition without the previous HUD/radar treatment.
- **Color and states:** near-black navy, restrained teal, slate, and amber communicate selection, evidence boundaries, review requirements, and unsupported outcomes consistently.
- **Assets:** the route uses the installed line-icon family and the existing Atlas mark; no placeholder, emoji, fabricated visual, or screenshot is used as interface content.
- **Copy:** coverage, source, approval, and review language remains bounded and consistent with the canonical product trust model.

## Functional verification

- Search and application selection update the dossier deterministically.
- Unsupported queries show no selected application and do not invent sources or method applicability.
- `Open application guide` resolves to `/blog/method-suitability-to-microbiology-lab-capacity?source=method-route`.
- `Use in Blueprint` resolves to `/quality-lab/planner?source=method-navigator`.
- Desktop and mobile browser console errors: 0.
- Mobile document width: 390 px at a 390 px viewport; no horizontal overflow.
- Repository gates after the change: `npm run validate`, 500 unit/server tests, and production build passed.

## Accessibility evidence and limits

- Search, application choices, route, named sources, actions, and metrics expose semantic labels and roles; application selection uses `aria-pressed` and the unsupported state clears all pressed buttons.
- The application index now uses a native list with list-item children; the automated WCAG 2.1 A/AA gate passes for Method Navigator on desktop and mobile.
- Screenshot evidence supports visible contrast, hierarchy, target separation, and mobile reflow, but cannot establish full keyboard or assistive-technology behavior.
- The in-app browser did not advance focus when synthetic Tab input was attempted, so manual keyboard traversal remains a verification gap rather than a claimed pass. Formal conformance still requires human assistive-technology review.

## Final result

final result: passed
