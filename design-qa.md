# Homepage dark Blueprint redesign — design QA

- Source visual truth: `tmp/design-audit/homepage-reference-research-2026-07-18/11-concept-2-dark-revision.png`
- Final desktop implementation: `tmp/design-qa/homepage-dark-blueprint/15-desktop-stable.png`
- Final mobile implementation: `tmp/design-qa/homepage-dark-blueprint/14-mobile-stable.png`
- Full-view comparison: `tmp/design-qa/homepage-dark-blueprint/16-source-vs-stable.png`
- Focused product-path evidence: `tmp/design-qa/homepage-dark-blueprint/08-desktop-products.png`
- Focused Product-menu evidence: `tmp/design-qa/homepage-dark-blueprint/04-desktop-product-menu.png`
- Viewports: desktop 1440 × 1024; mobile 390 × 844
- State: public homepage, signed out, animations settled

## Findings

- No actionable P0, P1, or P2 issues remain.
- [P3] The implementation's document stack is slightly smaller than the visual concept and its internal microcopy is optimized for legibility instead of matching every generated pixel. The hierarchy, document types, white-paper contrast, and illustrative-output label remain faithful.
- [P3] The implementation adds a tertiary `See every Atlas product` link in the hero. This is an intentional product requirement so Pro and Career remain discoverable without competing with the Quality Lab primary action.

## Required fidelity surfaces

- Fonts and typography: Space Grotesk remains the display face and Inter the body face. The final headline uses the same three-line desktop composition, strong optical weight, teal emphasis, and readable mobile reflow as the selected visual.
- Spacing and layout rhythm: the asymmetric hero, document stack, delivery notes, trust strip, and three-step section preserve the source grouping and vertical rhythm. Desktop and mobile have no horizontal overflow.
- Colors and visual tokens: the implementation uses the selected deep navy surface (`#061426`), off-white type, Atlas teal actions, muted steel-blue supporting text, and restrained dividers. Small text was checked for visible contrast on navy.
- Image quality and asset fidelity: the visible Blueprint document stack is a dedicated, inspected raster asset at `client/public/images/blueprint/quality-lab-blueprint-deliverables.png`; it is not CSS art or a placeholder. Existing editorial images and the Atlas icon system are preserved for supporting surfaces.
- Copy and content: the flagship offer, $149 diagnostic, $990 starting Blueprint scope, ten-business-day target, first microbiology wedge, trust boundaries, and illustrative-output language remain aligned with the Product Source of Truth. The monetization section explicitly covers Quality Lab, Pro, and the $20 Career Blueprint.
- Icons: existing Lucide icons were retained to match the repository design system, with consistent sizing and stroke treatment.
- Interaction and accessibility: Product dropdown, primary CTAs, anchor navigation, pricing links, and responsive reflow were browser-tested. Semantic links/buttons, focus-visible styles, descriptive image alt text, and practical mobile tap sizes are present. Browser console reported no errors.

## Comparison history

1. Initial comparison
   - Evidence: `05-desktop-final.png` and `06-source-vs-implementation.png`.
   - [P2] The headline wrapped to four lines and pushed the trust strip lower than the reference. The document group also read as too low in the composition.
   - Fix: widened the left hero track, reduced the desktop display size slightly, tightened top spacing, moved the asset group upward, and changed the first-wedge row so mobile text wraps as one unit.
2. Post-fix comparison
   - Evidence: `15-desktop-stable.png` and `16-source-vs-stable.png`.
   - Result: the headline returns to the intended three-line hierarchy, the document stack and trust strip align with the reference proportions, and no P0/P1/P2 mismatch remains.
3. Responsive and commercial-path pass
   - Evidence: `14-mobile-stable.png`, `08-desktop-products.png`, and `04-desktop-product-menu.png`.
   - Result: no horizontal overflow at 390 px or 1440 px; all three public paid paths and their pricing are visible; the desktop Product menu exposes the same paths; no console errors were present.

## Open questions

- None blocking. The generated mock does not define tablet-specific composition, so tablet uses the responsive desktop/mobile rules already established in the product.

## Implementation checklist

- [x] Match the selected dark document-focused hero.
- [x] Use a real Blueprint deliverable asset.
- [x] Keep every public monetization path discoverable.
- [x] Verify Product-menu interaction.
- [x] Verify desktop and mobile reflow with no horizontal overflow.
- [x] Check console errors.

## Follow-up polish

- P3 only: the document stack could be enlarged slightly on very wide screens after live traffic confirms it does not reduce primary-CTA attention.

final result: passed
