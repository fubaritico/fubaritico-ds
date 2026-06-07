# fubaritico-ds — Claude Code Instructions

## Project

Project to generate multi UI framework base on a stencilJS architecture. The project will be a tool to produce design system packages targeted for native web components, React, Angular and Vue. The component will visible in their respective storybook application.

- `apps/storybook-web-component` - [scaffold, no `package.json` yet] Storybook showcasing the generated native Web Components
- `apps/storybook-react` - [scaffold, no `package.json` yet] Storybook showcasing the generated React wrappers
- `apps/storybook-angular` - [scaffold, no `package.json` yet] Storybook showcasing the generated Angular wrappers
- `apps/storybook-vuejs` - [scaffold, no `package.json` yet] Storybook showcasing the generated Vue wrappers
- `packages/reference` - React/Tailwind design-system components used as a **reference / guide only — NOT a deliverable**. It exists to give ready-made example components that help build the real DS (like the sibling example repos). It is a sandbox to port from / validate approaches in; it may be **deleted once the work is finished**, or kept. Never treat it as a shipped package (e.g. don't permanently wire skin re-export, CI deploy, or public API guarantees around it).
- `packages/shared` - shared utils, test-utils, browser mocks, Tailwind theme + fonts, vite plugins
- `packages/stencil` - the **Stencil sandbox**: one Web Component project producing native WC + generated React/Angular wrappers (see its `README.md` + `PLAN.md`)
- `packages/tokens` - design tokens (Style Dictionary, OKLCH, DTCG) → generated CSS/JS/TS/Tailwind

Only these 4 packages exist today; the `apps/storybook-*` are empty scaffolds. [TODO] update as packages/apps are added.

## Your role

Help the developer — don't agree blindly. Challenge when warranted. Never work from assumptions: verify every hypothesis against the code, bring in the missing code references, and when that's not enough, verify online and cite your sources to debate solutions.

## Source code reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc@0.6 <package>           # npm package (e.g., npx opensrc zod)
npx opensrc@0.6 pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc@0.6 crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc@0.6 <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
# COMMAND UPDATE: the 0.6 version is working as expected, it brings back repos in a local opensrc dir and updates/creates AGENTS.md
npx opensrc@0.6 path <repo-git> # GitHub repo URL ex: https://github.com/tamagui/tamagui.git
# above commande fetches the repo if not present see online doc at: https://opensrc.sh/

```

## Critical Workflow Rules

- **Be concise** — no recap, no enumerations, no unsolicited explanations. Act, then report briefly if needed.
- **Discuss approach FIRST** — never code without confirming approach
- **Review → Test → Commit** per change — no accumulation
- **Always run** — `pnpm type-check && pnpm lint && pnpm test` from root — MUST run after every code change, never skip
- **Risky actions** (git push, reset --hard, rm -rf) require explicit permission EVERY TIME
- **Never hallucinate** — if uncertain, read code first
- **Verify APIs against source** — for any question about an API, library, or package, read it in `opensrc/` (see Source code reference) or search the web; never guess
- **Secrets** — live in `.env*` files — never in rules, memory, or code
- **Never `console.log`** — use `console.warn` / `console.error`
- **Never explicit `any`** — strict TypeScript
- **Always run** `pnpm type-check && pnpm lint && pnpm test` then `/review` after every set of modifications
- **Always ask** user to run `pnpm dev` (or `stencil build` for the stencil package) and `pnpm storybook` after having modified a component
- **Always create a Storybook story** after every component (`/story`)
- **Model**: Haiku for questions/research, Sonnet for code/commits — suggest Haiku when appropriate
- **For React**: instead of using `React.` for react types, import the type from react
- **Shared responsibility** — you and the user share ownership of code quality. Care about every line; review your own output before presenting it.
- **Research FIRST** — when something fails or behaves unexpectedly, search the web (GitHub issues, changelogs, docs) BEFORE modifying code. Most bugs are version incompatibilities or misconfigurations, not your code alone.
- **If it works elsewhere, it works here** — never conclude "it can't work" or write workaround mocks. Find the root cause in your setup (resolution paths, singletons, config) and fix it.
- **Never fallback values** — never serve hardcoded/stale data as silent degradation. If a runtime dependency (a build tool, generator, config) fails, surface the error; don't mask it.
- **Never `--no-verify`** on commit without the developer's explicit agreement
- **JSDoc everywhere (strict)** — every exported interface property, every function (`@param` + `@returns`), every hook, every type with properties, every constant. Exempt: generated artefacts (`packages/stencil/dist/{react,angular}`, `components.d.ts`) + test files.
- **Apply React skills** — apply `composition-patterns`, `react-best-practices`, and `react-view-transitions` when writing or reviewing component code

## Code Conventions

### React

- Functional components: `export function Name ({ ... }: NameProps)  { ... }`
- Import order: external → @fubaritico-ds/\* → relative → `import type` (newlines between groups)
- `clsx` for conditional classes

### Web components

To be updated.

### VueJS

To be updated.

### Angular

To be updated.

## Session State (updated by `/end-session`)

### Completed

Read @completed.md

### Next

Primary working branch is **`main`** (master is secondary). Memory holds the durable context
(`project-goal-stencil-discovery`, `monorepo-orchestration`, `reference-projects`, `tmdb-legacy-cleanup-backlog`).

1. **Create a git remote** (later) with `gh` and push `main`. No remote exists yet.
2. **Build the CI** modeled on the two reference projects (paths in memory `reference-projects`):
   `react-and-react-native-financial-app` and `vite-mf-monorepo`. Pipeline: Lerna+Nx
   (lint/type-check/test/build) + pa11y (needs a Storybook running) + **Sonar** (user will register the
   project on SonarCloud; `sonar` skill key = `fubaritico-ds`).
3. **Finish the Stencil setup** — PLAN step 5: create `packages/stencil/src/global/ui-stencil.css`
   and get `stencil build` green; then wire stencil into root `build` if needed.
4. **Port reference → Stencil Web Components**: `ui-badge` → `ui-button` → `ui-rating`. Compare the
   generated `dist/{react,angular}` wrappers to the hand-written React. Goal = understand Stencil, its
   limitations, and the WC model (bottom-up / no Context). See `packages/stencil/README.md`.

Decisions locked: keep **Lerna + Nx** (no Turbo). `packages/reference` is the port source.

### Known Issues

Read @known-issues.md

## Reference Files (load on demand — NOT auto-loaded)

| File                 | When to load                                     |
| -------------------- | ------------------------------------------------ |
| `architecture.md`    | Stack, packages, scripts, monorepo orchestration |
| `decision-tree.md`   | Skill triggers — check before coding             |
| `patterns-ui.md`     | UI component, design system story                |
| `tests.md`           | Writing tests — 5-level policy                   |
| `troubleshooting.md` | Debug, architectural decisions                   |

**Before coding**: ask which reference files are needed — do NOT start coding without the relevant files loaded.
