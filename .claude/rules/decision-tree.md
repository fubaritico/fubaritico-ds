# Rules — Decision Tree (BEFORE any action)

> Check this BEFORE writing any file. If a skill can generate it, use the skill.

## Skill Triggers — NEVER bypass

| I'm about to...                        | Invoke                 |
| -------------------------------------- | ---------------------- |
| Create a UI component (packages/ui)    | `/new-react-component` |
| Create an app section (embedded query) | `/new-section`         |
| Scaffold a new package or remote app   | `/add-package`         |
| Write a Storybook story                | `/story`               |
| Write tests                            | `/test`                |
| Review code (after a set of changes)   | `/review`              |
| Commit                                 | `/commit`              |
| Propose a commit message only          | `/message-commit`      |
| Fetch the SonarCloud report            | `/sonar`               |
| Start a work session                   | `/start-session`       |
| End a work session                     | `/end-session`         |

## Apply when writing/reviewing component code (composition primitives)

These are knowledge skills — apply their patterns, don't "invoke" them to generate files:

- `composition-patterns` — compound components, context, render props, React 19 APIs
- `solid-react-principles` — SRP/OCP/LSP/ISP/DIP for components
- `react-best-practices` — re-render, memoization, bundle, data-fetching perf
- `react-view-transitions` — animated route/UI transitions (React 19 View Transitions)

## Pre-flight — BEFORE writing code

1. Confirm the approach with the user (never code without confirming).
2. Ask which reference files are needed; read the relevant `.claude/rules/*` before coding.
3. Check if a skill handles this task (table above).
4. If yes → use the Skill tool, do NOT write manually.
5. If no → write code following the patterns, then run `pnpm type-check && pnpm lint && pnpm test` + `/review`.

## Rule

**NEVER write a file that a skill can generate.** Invoke the Skill tool instead.
A component is never "done" without its story (`/story`) and tests (5-level policy — see `tests.md`).
