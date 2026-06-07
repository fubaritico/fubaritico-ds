---
name: new-react-component
description: Create a new React UI component in packages/reference following the project patterns. Use when scaffolding a design system component.
allowed-tools: Read Write
argument-hint: "[ComponentName]"
metadata:
  version: "1.0"
---

# New React Component

Create a new UI component in `packages/reference` following the project patterns.

Reference the component patterns: @.claude/rules/component-patterns.md

## Steps

1. Read an existing similar component in `packages/reference/src/` as reference before writing anything
2. Create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.tsx` using `const Name: FC<NameProps>` pattern
3. If props require a discriminated union, create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.types.ts`
4. Create `packages/reference/src/$ARGUMENTS/$ARGUMENTS.test.tsx` with loading/error/interaction tests
5. Create `packages/reference/src/$ARGUMENTS/index.ts` re-exporting the component
6. Add export to `packages/reference/src/index.ts`
7. Run `/story $ARGUMENTS` to create the Storybook story

## Rules
- `ui:` prefix on ALL Tailwind classes
- No domain logic (no TMDB/movie concepts)
- Extend appropriate HTML attributes
- Export interface as named export, component as default
- Use `clsx` for conditional classes
- **Story is mandatory** — always run `/story` after creating the component
