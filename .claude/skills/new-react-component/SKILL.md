---
name: new-react-component
description: Create a new React UI component in packages/reference following the project patterns. Use when scaffolding a design system component.
allowed-tools: Read Write Edit
argument-hint: '[ComponentName]'
metadata:
  version: '1.1'
---

# New React Component

Create a new UI component in `packages/reference` following the project patterns.

Reference the component patterns: @.claude/rules/patterns-ui.md

> For compound / context components, the **Compound Components Pattern (React 19)** section in
> `patterns-ui.md` is mandatory: a dedicated access hook per context (encapsulated `use()` + guard —
> throw if required, return null if standalone), `<Context value>` providers, `use()`, `ref`-as-prop,
> `useEffectEvent`, and split-by-frequency contexts.

## Steps

A component is **three packages**, in this order: skin (`styles`) → resolver (`variants`) →
component (`reference`). Never start with the `.tsx`.

1. Read an already-**migrated** component as reference before writing anything — e.g.
   `packages/reference/src/components/Rating/` (flat, variant + size axes) or
   `packages/reference/src/components/Avatar/` (React 19 compound). Do NOT copy one still on Tailwind
   (Tabs, Drawer, Carousel, Typeahead, `next/Image`) — those ARE the migration backlog.
2. Add the BEM skin `packages/styles/src/styles/<block>.css`: block `.ui-<block>` inside
   `@layer ui.components`, `--ui-<block>-*` override vars, tokens only (no literals), logical
   properties. `@import` it from `packages/styles/src/native-styles.css`.
3. Add the CVA resolver `packages/variants/src/<component>.ts` (pure TS — no React, no DOM) emitting
   those BEM class names, plus any element-class constants; export it from `packages/variants/src/index.ts`.
4. Create `packages/reference/src/components/$ARGUMENTS/$ARGUMENTS.tsx` with the house style
   `export function $ARGUMENTS (…)` + `export default $ARGUMENTS` — **never** `const X: FC<XProps>`.
5. If props require a discriminated union, create
   `packages/reference/src/components/$ARGUMENTS/$ARGUMENTS.types.ts`
6. Create `packages/reference/src/components/$ARGUMENTS/$ARGUMENTS.test.tsx` covering the **5-level
   policy** (@.claude/rules/tests.md), plus resolver tests in `packages/variants/src/<component>.test.ts`
7. Create `packages/reference/src/components/$ARGUMENTS/index.ts` re-exporting the component
   (`export { default as $ARGUMENTS } from './$ARGUMENTS'`) and its prop/variant types
8. Add the export to the root barrel `packages/reference/src/index.ts`
9. Run `/story $ARGUMENTS` to create the Storybook story
10. Create the **usage doc** `packages/reference/src/components/$ARGUMENTS/README.md` (co-located
   README) following the mandatory plan in @.claude/rules/component-docs.md (identity → capabilities →
   import → basic usage → variants → edge cases → props → a11y → **Notes** = consumer-facing callouts
   for exceptions / misuse risks / gotchas). Plain Markdown with copy-pastable ` ```tsx ` examples —
   no Storybook blocks.

## Rules

- **The native BEM skin, NOT Tailwind** — classes come from the `@fubaritico-ds/variants` resolver.
  Never write new `ui:` Tailwind classes (that prefix only survives in the not-yet-migrated components).
- **GÉNÉREUX en variables de surcharge — mieux trop que pas assez.** Chaque propriété cosmétique
  mérite sa `--ui-<bloc>-*`. Une var inutilisée coûte une ligne ; une var manquante force le
  consommateur à court-circuiter le skin, et c'est là qu'un thème diverge. Densité de référence :
  `Slider` en expose **20**. Seule limite, la **mécanique** (centrage, zone de clic, calculs) : la
  skin possède le look, pas la géométrie.
- No domain logic — pure, presentational design-system components only
- Extend with `ComponentProps<'element'>` (never `HTMLAttributes`); `Omit` any native prop you repurpose
- Export the props interface as a named export, the component as default
- Use `clsx` for conditional classes
- **Story is mandatory** — always run `/story` after creating the component
- **README is mandatory** — a component with no co-located README is not done (`/review` fails it)

## Documentation rules (mandatory — enforced by `/review`)

Documentation is not optional decoration; it states intent so the next reader (or `/review`) can
verify behaviour. Apply ALL of:

- **Every custom hook** ships a JSDoc header: ONE sentence on _what it does_ + `@param` + `@returns`.
  Required even for one-line hooks (e.g. a context-access hook). The throw/return-null contract MUST
  be stated (see the Compound Components Pattern in `patterns-ui.md`).
- **Every hook CALL inside a component/hook** gets a one-line comment saying _what it does and why_ —
  `useEffect`, `useMemo`, `useCallback`, `use`, `useLayoutEffect`, `useEffectEvent`, non-trivial
  `useState`. The reader must understand the effect's purpose without reverse-engineering the deps.
  (A bare header above the hook is NOT enough — annotate the call site.)
- **Every component** ships a JSDoc header (what it is + `@param props` + `@returns`).
- **Every exported interface property / type / constant** is documented (project strict-JSDoc rule).
- Comments explain **why / what-for**, not a restatement of the code.
