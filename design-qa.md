# Methods Navigator Design QA

## Comparison target

- Source visual truth: `docs/design-references/methods-coverage-route.png`
- Rendered implementation: `docs/design-references/methods-implementation-fidelity-final.png`
- Normalized implementation: `docs/design-references/methods-implementation-fidelity-final-normalized.png`
- Route: `/methods`
- State: desktop, dark theme, guest, default query `microbial method suitability`, selected application `Microbial method suitability and recovery`
- CSS viewport: 1487 × 1058 at device pixel ratio 1
- Source pixels: 1487 × 1058
- Browser capture pixels: 1479 × 1052
- Density normalization: browser capture resampled once to 1487 × 1058 for equal-size comparison
- Mobile evidence: `docs/design-references/methods-implementation-fidelity-mobile.png`, 390 × 844 CSS viewport, 382 × 3282 full-page capture

## Comparison evidence

- Full view: `docs/design-references/methods-comparison-fidelity-final.png`
- Focused route and cards: `docs/design-references/methods-comparison-fidelity-route.png`
- Focused coverage radar: `docs/design-references/methods-comparison-fidelity-radar.png`

The focused comparisons were required because source rows, evidence-boundary copy, radar labels, icon scale, and panel geometry are too small to judge reliably from a full-view comparison alone.

## Fidelity surfaces

- Fonts and typography: the implementation uses the product's Inter/Space Grotesk system, restores the source's 40 px headline scale, 20 px search text, readable card labels, and stronger radar labels. Weight, wrapping, and hierarchy now follow the source. The in-app browser's normalized capture is visibly softer than the generated source, but the DOM renders at DPR 1 without CSS zoom.
- Spacing and layout rhythm: the five-stage route now uses a nine-track desktop grid with source-matched unequal card widths and gaps. Cards use independent heights instead of stretching to the tallest column. Header, search, route, cards, radar, and trust footer align to the same vertical landmarks as the source.
- Colors and visual tokens: near-black navy, teal, blue, and amber states map to the source while retaining existing Atlas tokens. Glow is limited to active route, selected application, and state signals.
- Image and asset fidelity: the existing generated observatory grid remains the background asset. Standard interface icons use the product's installed line-icon family. No screenshot, placeholder, emoji, handcrafted SVG, or fabricated customer asset replaces functional UI.
- Copy and content: route copy, named sources, evidence boundary, and actions remain canonical. Radar labels intentionally use the eight real non-sterile microbiology applications instead of the visually similar but product-inaccurate category names in the mock.
- Responsiveness and accessibility: the desktop visualization switches to a readable two-column application selector below the XL breakpoint. At 390 px there is no horizontal overflow (`scrollWidth` 382 for a 390 px viewport). Search, application buttons, links, and focus targets remain semantic and keyboard reachable.

## Comparison history

### Baseline — blocked

- P1: the five content columns stretched to a uniform height, creating large empty panels and losing the source hierarchy.
- P1: the coverage radar was reduced to a flat row of small pills, removing the source's strongest visual device.
- P2: source rows, status copy, and actions were undersized; the result looked like a dense technical table.
- Evidence: `docs/design-references/methods-implementation-final.png` and `docs/design-references/methods-comparison-full.png`.

Fixes applied:

- Rebuilt the route with independent panel heights and source-matched unequal columns.
- Restored 80 px route nodes, stronger connectors, larger typography, and source-aligned vertical spacing.
- Rebuilt the radar as an interactive fanned visualization with real application states and larger metric blocks.
- Removed the active Resources pill and unrelated navigation icons on this immersive surface to match the selected visual.

### Radar refinement — blocked

- P2: the first rebuilt radar pass still read as vertical columns and long application titles collided visually.
- Evidence: `docs/design-references/methods-implementation-fidelity-v4.png` and `docs/design-references/methods-implementation-fidelity-v5.png`.

Fixes applied:

- Fanned the eight segments around a shared lower origin.
- Counter-rotated segment content for upright reading.
- Added concise, factually equivalent radar labels while preserving full accessible button names.
- Rebalanced segment height, color, and selected-state glow.

### Final pass — passed

- Full-view composition, major-region proportions, route rhythm, card hierarchy, radar emphasis, metrics, and footer now follow the selected visual target.
- No actionable P0, P1, or P2 differences remain.
- Accepted P3 difference: the generated source uses broader product-category labels in its radar; implementation uses the canonical eight method applications to avoid presenting incorrect coverage.

## Functional verification

- Search with an unsupported query exposes `Not yet covered` without inventing a method.
- Selecting `Environmental monitoring methods` updates the query and selected application.
- Returning to `Microbial method suitability and recovery` restores the three named sources and guide action.
- `Open application guide` resolves to the expected internal guide route with selection context.
- Desktop and mobile states were rendered in the in-app browser.
- Browser console errors checked: 0.

## Final result

final result: passed
