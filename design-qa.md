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
- `npm test`: 73 files and 452 tests passed.
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

## Blueprint Connected System extension

### Comparison target

- Source process reference: `C:\Users\PC\AppData\Local\Temp\codex-clipboard-7df46ac7-5c19-4d47-9008-738956ded3fc.png`.
- Overview implementation: `artifacts/resource-connected-overview-desktop-viewport.png`.
- Guided selector state: `artifacts/resource-connected-guide-desktop.png`.
- Selected seven-stage system: `artifacts/resource-connected-system-desktop.png`.
- System-first Tools surface: `artifacts/resource-connected-tools-desktop.png`.
- Responsive evidence: `artifacts/resource-connected-overview-mobile.png`.
- Combined comparison input: `artifacts/resource-connected-system-comparison.png`.
- Viewports: desktop 1440 Ã— 1000 CSS px; mobile 390 Ã— 844 CSS px.

### Result

No actionable P0, P1, or P2 findings remain.

- The default `/workflows` state now presents five peer systems instead of implying one default process. Each card uses a consistent scientific symbol, system description, seven-stage count, and truthful Resource coverage count.
- The optional three-question selector is compact, keyboard reachable, and keeps the full-system path available through “Skip â€” view all systems”.
- Selecting a system reveals the existing seven-stage Process Blueprint. The combined comparison confirms the implementation retains the source reference's directional process rhythm, connected-node model, scientific symbol language, and upstream/downstream reading logic while using the product's dark technical palette.
- System and stage context remains visible when moving from Workflows to Tools and Academy. Browser Back restores the prior selected Resource state.
- A connected Tool detail displays system position, previous/current/next stages, sibling resources, Blueprint relevance, and an “Apply this reasoning in a Blueprint” action.
- Unmapped stage coverage is stated explicitly, while “Browse full catalog” remains accessible and marks unrelated items as “General reference”.

### Interaction, accessibility, and responsive checks

- Completed the guided route `QC laboratory â†’ Investigate â†’ Calculate`; the browser reached `/tools?system=qc-laboratory&stage=lab-investigations` and showed two explicitly connected tools.
- Moved through the Resource rail to Academy and back to Tools; `system` and `stage` persisted in both directions.
- Opened the OOS Investigation Decision Tree and confirmed multi-system context plus adjacent-stage navigation.
- Verified the zero-tool state for Biopharma / Cell source & materials and the continued availability of the full catalog.
- Desktop and mobile document widths match their viewports with no page-level horizontal overflow. The selected seven-stage row intentionally scrolls within its own container on smaller screens.
- Keyboard focus is visible on the guided selector and stage controls. Headings, regions, labels, pressed states, and navigation landmarks are exposed semantically.
- The in-app browser console reported no warnings or errors after the overview, selector, cross-Resource navigation, detail, coverage-gap, desktop, and mobile passes.

### Residual P3 differences

- The source reference is a single Biopharma manufacturing sequence, while the product entry state must compare five systems. The implementation preserves the linear sequence only after system selection so the information architecture stays truthful.
- The implementation uses production Phosphor symbols rather than custom equipment illustrations. This keeps icon weight consistent across all five systems and seven Resource areas.

final result: passed

## Workflow sequence correction

### Evidence

- Reported zig-zag state: `artifacts/01-workflow-flow-before.png`.
- Stage-selection inspection: `artifacts/02-workflow-stage-five-before-fix.png`.
- First linear pass: `artifacts/03-workflow-linear-flow-after.png`.
- Final wide layout: `artifacts/04-workflow-linear-final-wide.png`.
- Final selected-stage mobile layout: `artifacts/05-workflow-linear-final-mobile.png`.

### Result

- Replaced the split 1-4 / 7-5 snake with one unambiguous left-to-right sequence from stage 1 through stage 7.
- On narrower desktop and mobile viewports, only the stage strip scrolls horizontally; the document itself does not overflow.
- Direct links and stage changes keep the active stage inside the visible strip without moving the page vertically.
- Desktop at 1900 x 900 shows all seven stages simultaneously. Mobile at 390 x 844 centers the selected stage and retains the adjacent-process cue.
- Type checking passed after the interaction change.

final result: passed
