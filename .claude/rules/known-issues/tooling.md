---
paths:
  - "package.json"
  - "**/package.json"
  - "pnpm-workspace.yaml"
  - "nx.json"
  - "lerna.json"
  - "eslint.config.js"
  - "commitlint.config.*"
  - ".husky/**"
  - ".github/**"
  - "sonar-project.properties"
  - ".claude/skills/sonar/**"
---
# Known issues — tooling (CI, SonarCloud, lint, commits)

> Slice of `.claude/known-issues.md` (the index). Loads when a root config, the CI or the lint is touched.

- **SonarCloud: main branch `master` while the repository is on `main` (fixed 2026-10-08)** — a costly trap,
  not to suffer again. The project had been initialised with **`master`** as main branch (`isMain: true`), a
  branch that **does not exist** in the repository and was analysed once, on 07/06, by the one-shot workflow
  `sonar-init.yml`. Every CI analysis since June therefore went to a **SHORT `main` branch**, and **the free
  plan forbids reading non-main branches** (`"Organization is not allowed to access data from non main
  branches"`). **Misleading symptom**: the CI is green, the Compute Engine tasks are `SUCCESS`, the scanner
  publishes — but the API, the project page and the quality gate read `master` and return data frozen on
  07/06 (old paths `src/<Component>/`, `MovieCard`, `react-router/`, all deleted since). **Do NOT conclude
  that the CI is broken**: first check `api/project_branches/list?project=…` and the value of `isMain`. Fix
  applied: `project_branches/delete?branch=main` then `project_branches/rename?name=main`. The project was
  also made **public** (`visibility: public`) — free and unlimited, the GitHub repository being public.
- **`SONAR_TOKEN`: a USER token is needed, not an analysis token** — `/sonar` queries
  `api/qualitygates/project_status` and `api/issues/search`, two **read** endpoints (_Browse_ permission). A
  **Project/Global Analysis Token** only grants _Execute Analysis_: it runs the scan in CI but **cannot read**
  the issues. Hence the normal asymmetry: the GitHub Actions secret (analysis) and the local `.env` (reading)
  do not need the same thing. Least-privilege alternative for local use: a **Scoped Organization Token**
  (`sqco_`) with _Browse_ on this project only — but only a subset of endpoints accepts SOTs, check before
  relying on it.
- **`packages/styles` has no lint/type-check scripts** — REPO-138 (CSS-only) → `lerna run` and CI skip those. It HAS a `test` script since 2026-10-11 (Vitest, `test/` — source checks on the CSS, e.g. the radius API parity). Add `stylelint` later for real CSS linting.
- **eslint typed-lint poison from empty-src `stencil/tsconfig.json`** — REPO-137: the base `project: ['./packages/*/tsconfig.json']` glob loads stencil's build tsconfig, which has no inputs (TS18003). Any package **alphabetically after `stencil`** that relies on the base glob (e.g. `variants`) crashes with "Unable to parse the specified tsconfig". Fix per package = a scoped eslint override pointing at its own tsconfig (see the `variants` override in `eslint.config.js`, mirroring the `stencil` one). Real fix later: migrate the root config to `projectService: true`, or give stencil a non-empty tsconfig.
- **Harness "plan mode" green overlay can persist** in the prompt (cosmetic, harness-side). Exit with Shift+Tab / Esc. We don't use plan mode — plans live in `files/plans/`.
- **commitlint `subject-case`**: the commit subject must be **lowercase** — a subject starting with a PascalCase word (e.g. `Typography uses…`) is rejected. Write `use … on Typography` instead.
- **commitlint `body-max-line-length` hidden by the pre-commit output**: a body line of 101 characters makes
  the commit fail, but the cause is buried under the gate's build and test output. Keep body lines ≤ 100;
  test a message alone with `pnpm exec commitlint --edit <file>` (or `echo "…" | pnpm exec commitlint`).
