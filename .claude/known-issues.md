# Known Issues

Put here the know issues to avoid cluttering the context window.

- **Dotted token names not referenceable in native CSS**: `--spacing-0.5`, `--spacing-2.5` (dot in the name) can't be used via `var()` in the skin → use a literal rem value + explaining comment. Non-dotted tokens (`--spacing-1/2/3`, etc.) are fine.
- **`packages/styles` has no lint/type-check/test scripts** (CSS-only) → `lerna run` and CI silently skip it. Acceptable for now; add `stylelint` later if we want CSS coverage in the quality gate.
- **`badgeVariants` (CVA) lives in `packages/reference`** (a non-deliverable). It must be **promoted to `@fubaritico-ds/shared`** so WC/Angular/Vue can reuse it without depending on reference. (review-flagged; next-session priority.)
- **`color.semantic.badge.primary` token still references amber** (not blue) — unused by the migrated Badge default (which uses `--color-primary`), but inconsistent; arbitrate later (follow primary, or rename to a distinct accent).
- **Harness "plan mode" green overlay can persist** in the prompt (cosmetic, harness-side). Exit with Shift+Tab / Esc. We don't use plan mode — plans live in `files/plans/`.
