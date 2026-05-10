# BioWiki Pro Microbiology Intelligence MVP

## Project Notes

- The current app uses `client/src` as the Vite React source root, Wouter for routing, Tailwind CSS, shadcn/ui primitives, Lucide icons, Framer Motion, React Query, and Context API.
- Existing main routes are `/qc-hub`, `/academy`, `/academy/:slug`, `/tools`, `/compliance`, `/career`, `/solutions`, `/settings`, `/upgrade`, `/login`, `/register`, `/pricing`, and `/payment/success`.
- Existing layout is shared through `client/src/App.tsx` with `DesktopNav`, `MobileHeader`, and `BottomNav`. The MVP should preserve this shell and extend routes rather than replace the app.
- Existing content data is mostly static in `client/src/data/mockData.ts`. The Microbiology Intelligence MVP should follow that pattern with static TypeScript data and localStorage.

## Implementation Approach

- Add microbiology intelligence types under `client/src/types` because this repository does not use a root `src` folder.
- Add static lesson, scenario, compliance, and tool data under `client/src/data`.
- Add feature modules under `client/src/features` and keep existing page files as route wrappers.
- Keep the UI mobile-first, premium, and B2B SaaS oriented with compact cards, filters, and decision-support blocks.
- Avoid backend, authentication, database, or large refactors in this MVP phase.

## MVP Modules

- Academy: director-level lessons, lesson detail, knowledge cards, case studies, audit questions, and save actions.
- Tools: EM scenario decision tree, CCS Builder Lite, and investigation template viewer.
- Compliance: Annex 1 topic cards and audit question bank.
- Vault Lite: localStorage-backed saved lessons, audit questions, case studies, and investigation notes.
