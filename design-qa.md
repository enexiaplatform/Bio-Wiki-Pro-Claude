# Resource Process Blueprint — Design QA

## Comparison target

- Source visual truth: `C:\Users\PC\.codex\generated_images\019fe571-034f-77e3-a631-6b236321a7c3\exec-402f5bad-7478-4df5-926e-4f9654feae77.png`
- Browser-rendered implementation: `artifacts/resource-process-blueprint-desktop-v2.png`
- Full-view comparison: `artifacts/resource-process-blueprint-comparison-v2.png`
- Process-map focus comparison: `artifacts/resource-process-blueprint-map-focus.png`
- Detail-drawer focus comparison: `artifacts/resource-process-blueprint-drawer-focus.png`
- Responsive evidence: `artifacts/resource-process-blueprint-mobile.png`
- Route/state: `/workflows`, dark theme, Biopharma system, stage 4 Formulation & fill-finish selected, guest state.
- Viewport: desktop CSS viewport 1488 × 1056; mobile CSS viewport 390 × 844.
- Pixel dimensions and density: source 1488 × 1056; desktop implementation 1488 × 1056; mobile implementation 390 × 844. Full-view comparison used equal pixel dimensions with no density resampling. Focus comparisons crop and resize only the corresponding process-map and detail-drawer regions for readable inspection.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] Stage symbols are library-native rather than bespoke equipment drawings.
  - Location: seven stage nodes.
  - Evidence: the source uses custom bioreactor, chromatography, vial-line, and analytical-equipment illustrations; the implementation uses the closest Phosphor line symbols.
  - Impact: the implementation is slightly less illustrative but remains clear, consistent, accessible, and faithful to the selected technical-blueprint language.
  - Follow-up: commission a matched seven-symbol production icon set only if brand differentiation warrants the extra asset work.

- [P3] Live product copy and counts differ from the illustrative mock.
  - Location: linked-resource rail and bottom evidence drawer.
  - Evidence: the mock uses illustrative labels/counts, while the implementation resolves the repository's real workflow, tool, lesson, and toolkit records for the selected stage.
  - Impact: visual density remains equivalent and the implementation is more truthful to the product data.
  - Follow-up: none required.

## Required fidelity surfaces

- Fonts and typography: existing Inter body and Space Grotesk display fonts are preserved. Heading hierarchy, small uppercase labels, 14–16px reading text, truncation, and optical weight match the target closely.
- Spacing and layout rhythm: the final canvas is edge-to-edge below the primary navigation, with the 7.25rem resource rail, compact header, two-row process map, right application rail, and bottom detail drawer aligned to the source proportions. Desktop and mobile show no document-level horizontal overflow.
- Colors and visual tokens: deep navy surfaces, teal active paths, muted steel-blue inactive controls, and coral critical-control accents match the target palette and retain sufficient contrast.
- Image quality and asset fidelity: the bottom drawer uses an existing high-resolution editorial laboratory image with a deliberate crop and credit metadata. Visible UI symbols use the Phosphor icon library; no handcrafted SVG, CSS illustration, emoji, or placeholder asset is used.
- Copy and content: interface copy is English-only, concise, and uses real stage-linked product records. The evidence boundary remains visible and does not overstate applicability.

## Comparison history

### Pass 1 — blocked

- [P2] The implementation used an inset rounded container while the source used an edge-to-edge technical canvas.
- [P2] The system selector created an over-tall header that compressed the process map.
- [P2] Six linked applications were visible at once, making the right rail denser than the four-link source state.
- [P2] The drawer used a background image behind the primary action instead of a separate photo cell.
- Evidence: `artifacts/resource-process-blueprint-desktop.png` and `artifacts/resource-process-blueprint-comparison.png`.

### Fixes applied

- Opened the blueprint to the full resource content width and removed the outer card framing.
- Moved the system selector into the eyebrow row and shortened the displayed Biopharma title.
- Limited the default right rail to four key links with a functional control for the remaining stage resources.
- Split the bottom image into its own cell and restored the target drawer proportions.
- Added the shared symbol-led Resource rail to Methods, Monitor, Workflows, Academy, Tools, Toolkits, and Compliance.
- Fixed Academy filter grid min-width behavior that caused mobile document overflow.

### Pass 2 — passed

- Post-fix evidence: `artifacts/resource-process-blueprint-desktop-v2.png`, `artifacts/resource-process-blueprint-comparison-v2.png`, `artifacts/resource-process-blueprint-map-focus.png`, and `artifacts/resource-process-blueprint-drawer-focus.png`.
- The revised composition, hierarchy, palette, stage selection, application rail, and detail drawer match the selected direction without actionable P0/P1/P2 drift.

## Interaction and responsive checks

- Selected Downstream clearance on mobile; the detail state changed to stage 3.
- Switched from Biopharma to QC laboratory; the title, seven stages, and linked applications changed to the selected system.
- Opened Tools from the shared Resource rail; navigation reached `/tools` and rendered the expected heading.
- Verified all seven Resource index routes render with the shared rail: `/methods`, `/monitor`, `/workflows`, `/academy`, `/tools`, `/toolkits`, and `/compliance`.
- Verified 390px mobile document width on all seven routes after the Academy min-width fix; no page-level horizontal overflow remains.
- Checked the in-app browser console after the final route and interaction pass; no error-level messages were present.

## Validation

- `npm run validate`: passed.
- `npm test`: 72 files and 443 tests passed.
- `npm run build`: passed.

## Remaining Resource organization QA

- Source visual truth: `C:\Users\PC\AppData\Local\Temp\codex-clipboard-400792b0-7355-4fdd-bf49-cd6629fc7e3f.png` (278 × 454).
- Browser-rendered implementation: `artifacts/resource-tools-organized-final.png` (1432 × 994 browser capture at a 1440 × 1000 CSS viewport).
- Navigation focus comparison: `artifacts/resource-navigation-comparison.png`.
- State: `/tools`, expanded descriptive Resource rail, guest state.

### Result

No actionable P0, P1, or P2 findings remain.

- The expanded rail matches the reference hierarchy: one all-caps orientation label followed by seven symbol-led destinations, each with a strong title and muted purpose line.
- The implementation uses the existing dark navy and teal product tokens and adds a clear active-route state. This is an intentional product affordance absent from the static reference.
- Methods, Monitor, Academy, Tools, Toolkits, and Compliance each now place a three-step orientation flow directly after the hero. The strips use one consistent visual grammar: context label, three numbered actions, directional connectors, and a link to connected systems.
- The Workflows route intentionally keeps the compact rail so the selected Process Blueprint retains enough horizontal space.
- Desktop checks confirmed the expanded rail and correct flow copy on all six remaining Resource indexes.
- Mobile checks confirmed the compact horizontal Resource navigator on all seven indexes, with no document-level horizontal overflow.
- Focused comparison was necessary for the navigation because the full-page capture made 11–12px labels too small to judge; the combined focus image confirms readable hierarchy, spacing, symbol alignment, and purpose copy.

### Residual P3 differences

- The implementation uses Phosphor line icons instead of the reference's exact symbol set. Stroke weight and semantic clarity are close, and all icons come from one production library.
- The active route has a subtle teal background to improve orientation; the reference shows no explicit selected state.

## Follow-up polish

- A bespoke seven-symbol bioprocess icon family could move the final P3 asset difference closer to the generated mock.

final result: passed
