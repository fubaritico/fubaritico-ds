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

- **SonarCloud : branche principale `master` alors que le dépôt est sur `main` (résolu 2026-10-08)** —
  piège coûteux, à ne pas re-subir. Le projet avait été initialisé avec **`master`** comme branche
  principale (`isMain: true`), branche qui **n'existe pas** dans le dépôt et n'a été analysée qu'une
  fois, le 07/06, par le workflow one-shot `sonar-init.yml`. Toutes les analyses de la CI depuis juin
  partaient donc sur une branche **`main` de type SHORT**, et **le plan gratuit interdit la lecture des
  branches non principales** (`"Organization is not allowed to access data from non main branches"`).
  **Symptôme trompeur** : la CI est verte, les tâches Compute Engine sont en `SUCCESS`, le scanner
  publie — mais l'API, la page projet et le quality gate lisent `master` et renvoient des données
  gelées au 07/06 (anciens chemins `src/<Component>/`, `MovieCard`, `react-router/`, tous supprimés
  depuis). **Ne PAS en conclure que la CI est cassée** : vérifier d'abord
  `api/project_branches/list?project=…` et la valeur de `isMain`. Correctif appliqué :
  `project_branches/delete?branch=main` puis `project_branches/rename?name=main`. Le projet a aussi été
  basculé **public** (`visibility: public`) — gratuit et illimité, le dépôt GitHub l'étant déjà.
- **`SONAR_TOKEN` : il faut un USER token, pas un token d'analyse** — `/sonar` interroge
  `api/qualitygates/project_status` et `api/issues/search`, deux endpoints de **lecture** (permission
  _Browse_). Un **Project/Global Analysis Token** ne donne que _Execute Analysis_ : il fait tourner le
  scan en CI mais **ne peut pas lire** les issues. D'où l'asymétrie normale : le secret GitHub Actions
  (analyse) et le `.env` local (lecture) n'ont pas le même besoin. Alternative moindre-privilège pour
  le local : un **Scoped Organization Token** (`sqco_`) en _Browse_ sur le seul projet — mais seul un
  sous-ensemble des endpoints est compatible SOT, à vérifier avant de s'y fier.
- **`packages/styles` has no lint/type-check scripts** — REPO-138 (CSS-only) → `lerna run` and CI skip those. It HAS a `test` script since 2026-10-11 (Vitest, `test/` — source checks on the CSS, e.g. the radius API parity). Add `stylelint` later for real CSS linting.
- **eslint typed-lint poison from empty-src `stencil/tsconfig.json`** — REPO-137: the base `project: ['./packages/*/tsconfig.json']` glob loads stencil's build tsconfig, which has no inputs (TS18003). Any package **alphabetically after `stencil`** that relies on the base glob (e.g. `variants`) crashes with "Unable to parse the specified tsconfig". Fix per package = a scoped eslint override pointing at its own tsconfig (see the `variants` override in `eslint.config.js`, mirroring the `stencil` one). Real fix later: migrate the root config to `projectService: true`, or give stencil a non-empty tsconfig.
- **Harness "plan mode" green overlay can persist** in the prompt (cosmetic, harness-side). Exit with Shift+Tab / Esc. We don't use plan mode — plans live in `files/plans/`.
- **commitlint `subject-case`**: the commit subject must be **lowercase** — a subject starting with a PascalCase word (e.g. `Typography uses…`) is rejected. Write `use … on Typography` instead.
