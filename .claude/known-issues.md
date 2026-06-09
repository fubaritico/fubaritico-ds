# Known Issues

Put here the know issues to avoid cluttering the context window.

- **Dotted token names not referenceable in native CSS**: `--spacing-0.5`, `--spacing-2.5` (dot in the name) can't be used via `var()` in the skin → use a literal rem value + explaining comment. Non-dotted tokens (`--spacing-1/2/3`, etc.) are fine.
- **`packages/styles` has no lint/type-check/test scripts** (CSS-only) → `lerna run` and CI silently skip it. Acceptable for now; add `stylelint` later if we want CSS coverage in the quality gate.
- **eslint typed-lint poison from empty-src `stencil/tsconfig.json`**: the base `project: ['./packages/*/tsconfig.json']` glob loads stencil's build tsconfig, which has no inputs (TS18003). Any package **alphabetically after `stencil`** that relies on the base glob (e.g. `variants`) crashes with "Unable to parse the specified tsconfig". Fix per package = a scoped eslint override pointing at its own tsconfig (see the `variants` override in `eslint.config.js`, mirroring the `stencil` one). Real fix later: migrate the root config to `projectService: true`, or give stencil a non-empty tsconfig.
- **`color.semantic.badge.primary` token still references amber** (not blue) — unused by the migrated Badge default (which uses `--color-primary`), but inconsistent; arbitrate later (follow primary, or rename to a distinct accent).
- **Harness "plan mode" green overlay can persist** in the prompt (cosmetic, harness-side). Exit with Shift+Tab / Esc. We don't use plan mode — plans live in `files/plans/`.
- **commitlint `subject-case`**: the commit subject must be **lowercase** — a subject starting with a PascalCase word (e.g. `Typography uses…`) is rejected. Write `use … on Typography` instead.
- **`ui-typography--gutter-bottom` uses a hardcoded `0.35em`** (commented MUI parity, em-relative so it scales with the variant). No token for it; tokenize later if a per-theme gutter is wanted.
- **`--ui-spinner-thickness` ring widths are literals** (`2px`/`4px`/`6px` per size) — no border-width token exists in `tokens` (same gap as Badge's `1px` border). Values are hoisted into the component var so consumers can still override; add a `--border-width-*` token scale later if we want a single source of truth.
- **Spinner `prefers-reduced-motion` slows (2s) rather than stops** the spin — deliberate: a spinner is _essential_ motion (conveys "busy"), so it's exempt from WCAG 2.3.3, and a fully-stopped ring reads as frozen/broken. Revisit if a static/pulse fallback is preferred.
