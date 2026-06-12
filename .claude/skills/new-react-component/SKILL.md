---
name: new-react-component
description: Create a new React UI component in packages/reference following the project patterns. Use when scaffolding a design system component.
allowed-tools: Read Write
argument-hint: '[ComponentName]'
metadata:
  version: '1.0'
---

# New React Component

Create a new UI component in `packages/reference` following the project patterns.

Reference the component patterns: @.claude/rules/patterns-ui.md

> For compound / context components, the **Compound Components Pattern (React 19)** section in
> `patterns-ui.md` is mandatory: a dedicated access hook per context (encapsulated `use()` + guard —
> throw if required, return null if standalone), `<Context value>` providers, `use()`, `ref`-as-prop,
> `useEffectEvent`, and split-by-frequency contexts.

## Steps

1. Read an existing similar component in `packages/reference/src/` as reference before writing anything
2. Create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.tsx` using `const Name: FC<NameProps>` pattern
3. If props require a discriminated union, create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.types.ts`
4. Create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.test.tsx` with loading/error/interaction tests
5. Create `packages/reference/src/$ARGUMENTS/index.ts` re-exporting the component
6. Add export to `packages/reference/src/index.ts`
7. Run `/story $ARGUMENTS` to create the Storybook story
8. Create the **usage doc** `packages/reference/src/$ARGUMENTS/README.md` (co-located README) following the
   mandatory plan in @.claude/rules/component-docs.md (identity → capabilities → import → basic usage →
   variants → edge cases → props → a11y → **Notes** = consumer-facing callouts for exceptions / misuse
   risks / gotchas). Plain Markdown with copy-pastable ` ```tsx ` examples — no Storybook blocks.

## Rules

- `ui:` prefix on ALL Tailwind classes
- No domain logic — pure, presentational design-system components only
- Extend appropriate HTML attributes
- Export interface as named export, component as default
- Use `clsx` for conditional classes
- **Story is mandatory** — always run `/story` after creating the component

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
