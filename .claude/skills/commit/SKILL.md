---
name: commit
description: Prepare and propose a conventional commit for the current changes. Use when committing code, creating a git commit, or finalizing a set of changes.
allowed-tools: Bash(git:*)
metadata:
  version: '1.0'
---

# Commit

Prepare and propose a conventional commit for the current changes.

## Steps

1. Run `git status` to see changed files
2. Run `git diff --staged` and `git diff` to analyze all changes
3. Identify the scope based on changed files:
   - `packages/reference` → scope `reference` (or `ui`)
   - `packages/behaviors` → scope `behaviors`
   - `packages/shared` → scope `shared`
   - `packages/stencil` → scope `stencil`
   - `packages/styles` → scope `styles`
   - `packages/tokens` → scope `tokens`
   - `packages/variants` → scope `variants`
   - root / monorepo config → scope `repo`
   - Multiple packages → use the most impacted scope
4. Generate a conventional commit message — its TYPE must tell the truth (a fix is `fix`, even found by
   a test): the changelog is built from it
5. Propose the exact commands to run (user executes them)
6. **The ticket** (`/trello`): a ticket's work is committed after the dev checked it (Definition of
   Done, step 6); the hash goes in the ticket's comment, then `done`

## Commit format

```
type(scope): subject

- bullet point detail if needed
```

## Allowed types

`feat` `fix` `refactor` `style` `test` `docs` `chore` `build` `ci` `perf` `revert`

## Rules

- Subject: lowercase, no trailing period, max 100 chars total
- Body: bullet points for non-obvious changes
- Never skip pre-commit hook (runs typecheck + lint + test automatically)
- One feature per commit — do not accumulate unrelated changes
- Stage specific files by name, never `git add .` or `git add -A`
