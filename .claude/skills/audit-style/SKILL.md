---
name: audit-style
description: Audit and refactor the design system's native CSS skin (packages/styles) against strict BEM — naming, low specificity, tokens only, @layer override-first, component variables, logical properties, CVA↔skin parity. Used by /review for every *.css file.
when_to_use: 'Quand le dev dit « audite le CSS », « vérifie le BEM », « le skin est-il propre », « refactore les styles », « audit de style ».'
argument-hint: '[block name or path — default: the whole skin]'
metadata:
  author: fubaritico-ds
  version: '2.0'
---

# Audit Style — the native BEM skin

Audits `packages/styles/src/styles/*.css` (one file per block) and the class names `packages/variants`
emits, then reports or fixes. **The skin is the product**: one portable CSS for React, Web Components,
Angular and Vue, themed by tokens, re-skinned through component variables.

## The rules — one source

The rules are the **STYLE-001…013** of `.claude/agents/review/styles.md` (utility classes, BEM naming,
specificity, `!important`, CVA↔skin parity, hardcoded values, `@layer`, component variables, redundant
modifiers, element vs block modifier, logical properties, DOM-hierarchy styling, portability). Read that
file first; this skill is the procedure. The patterns behind them: `rules/patterns-ui.md` (generous
override variables), `rules/known-issues/styles-tokens.md`, the `bem-structure` skill.

## The shape of a block (from `badge.css`)

```css
@layer ui.components {
  .ui-badge {
    /* ---- override API (component-scoped) ---- */
    --ui-badge-bg: var(--color-primary);
    --ui-badge-padding-inline: var(--spacing-2-5);

    /* ---- base ---- */
    box-sizing: border-box; /* self-sufficient: the DS ships no global reset */
    padding-inline: var(--ui-badge-padding-inline);
    background-color: var(--ui-badge-bg);
  }
  .ui-badge--outline {
    --ui-badge-bg: transparent;
  } /* a modifier re-points vars */
}
```

- Block `.ui-<block>`, element `.ui-<block>__<element>`, modifier `.ui-<block>--<modifier>`.
- Every value comes from a token (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`) through a
  `--ui-<block>-*` variable; a modifier changes variables, not properties.
- Everything inside `@layer ui.components` (order declared in `native-styles.css`: `ui.reset, ui.base,
ui.components`), so an unlayered consumer rule wins without a specificity war.
- The one `!important` of the skin is the closed-state guard of `state-guards.css` (`ui.reset`).

## Procedure

1. **Inventory** — the block files in scope, `@import`ed from `native-styles.css`; for each block its
   resolver `packages/variants/src/<component>.ts` and its component in `packages/reference`.
2. **Detect** — walk STYLE-001…013 on each file. Token names: check them against the generated
   `packages/tokens/dist/css/variables.css` (a misspelt `var(--…)` fails silently). Parity: every class the
   resolver emits has a selector, and every modifier selector is emitted.
3. **Report** — the table `ID · Sév · Catégorie · Description · Statut`, `file:line`, before any fix.
4. **Fix** (only once the dev agreed) — the smallest change per finding; never a visual change hidden in a
   refactor. A renamed class or variable is a breaking change for consumers (`feat!`/`fix!`).
5. **Prove** — `pnpm --filter @fubaritico/styles test` (contract tests in `packages/styles/test/`),
   `pnpm --filter @fubaritico/variants test`, then the full gate; rebuild and ask the dev to check the
   story in Storybook (`pnpm build`, `pnpm storybook:ref` — it reads the built dist).

## Modes

- **Report** (default) — findings only.
- **Patch** — the findings plus the proposed diff, nothing applied.
- **Fix** — applied after the dev's go, then step 5.

## Never

- A literal colour, length or font in a skin (except `0`, `1px` borders, `100%`, `auto`).
- A selector by tag, id or DOM depth; a class that a framework would rename.
- A global reset or a rule outside a block (the DS styles only its own blocks).
- A Tailwind or utility class — the `ui:` prefix is legacy (Carousel, `next/*` — REACT-134).
