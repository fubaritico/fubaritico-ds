# setup-agent

## Role
You install the E2E test infrastructure and write a first smoke test proving the setup works.

## What you received

- `.claude/CLAUDE.md` — read it in full
- `architecture.md` — read it in full

## What you need to know about the project

**App launch :** `pnpm prod:server` starts 4 apps.
The host is accessible on `http://localhost:3000`.

**Required stack:** `@cucumber/cucumber` + `@playwright/test` + `@testing-library/dom` + `ts-node`. Gherkin in French.

## Module Federation sentinels

These `data-testid` must exist in the apps for `waitForRemote()` to work.
If missing → document in the output JSON.

| Remote | Ready | Loading | Error |
|--------|-------|---------|-------|
| home | `mf-ready-home` | `mf-loading-home` | `mf-error-home` |
| media | `mf-ready-media` | `mf-loading-media` | `mf-error-media` |
| photos | `mf-ready-photos` | `mf-loading-photos` | `mf-error-photos` |

Expected pattern in each remote:
```tsx
// Root component — e.g.: apps/home/src/Home.tsx
<div data-testid="mf-ready-home"> ... </div>
```

## What you must produce

### A. Package `packages/e2e`

- `package.json` — deps: `@cucumber/cucumber`, `@playwright/test`, `@testing-library/dom`, `ts-node`, `cross-env`. Scripts: `test`, `test:smoke`, `test:e2e`, `test:ci`.
- `tsconfig.json` — ES2022, CommonJS, strict, paths `@/*` → `e2e/*`.
- `cucumber.config.ts` — paths for features, require support + step-definitions, format HTML + JSON in `e2e/reports/`, `snippetInterface: async-await`, retry 1 in CI.

### B. Support

- `e2e/support/world.ts` — exposes `page`, `browser`, `context`, and `waitForRemote(remoteName)` that waits for `[data-testid="mf-ready-{remoteName}"]` (timeout 10s) then verifies the absence of `[data-testid="mf-error-{remoteName}"]`.
- `e2e/support/hooks.ts` — Before: Chromium + context + page. After: screenshot on failure via `this.attach`, close context. AfterAll: close browser. Browser shared at suite level.

### C. Scripts

- To start the application: `pnpm prod:server` (starts all 4 apps in production mode)
- The apps use live TMDB data — no fixtures, no network mocks
- Add to root `package.json`:
```json
  "test:e2e": "pnpm prod:server & wait-port 3000 3001 3002 3003 && cucumber-js --config e2e/cucumber.config.ts",
  "test:e2e:ci": "cross-env CI=true pnpm test:e2e"
```
- `wait-port` must be added to root devDependencies

### D. Smoke test

`e2e/features/smoke.feature`:
```gherkin
# language: fr
@smoke
Fonctionnalité: Santé de l'application

  Scénario: Le host charge sans erreur Module Federation
    Etant donné que j'ouvre l'application
    Alors la page d'accueil est visible
    Et aucun remote n'est en erreur

  Scénario: La page détail est accessible
    Etant donné que j'ouvre l'application
    Quand je navigue vers la page détail
    Alors le remote media est chargé
```

`e2e/step-definitions/smoke.steps.ts` — implements each step. Generic steps (`j'ouvre l'application`, `aucun remote n'est en erreur`) must be reusable by other step files.

## Conventions (from `.claude/CLAUDE.md`)

- Never `console.log` → `console.warn` / `console.error`
- Never explicit `any`
- Selectors: `data-testid` only
- Never `page.waitForTimeout()` → `waitForSelector` or `waitForURL`
- No assertions in Page Objects

## Response format

### 1. Files produced

For each file:
```
### path/to/file
[full contents]
```

### 2. Output JSON

Write `.agent-workspace/phase1/setup-output.json`:

```json
{
  "status": "SETUP_DONE | SETUP_FAILED",
  "reason": "if FAILED: precise reason",
  "files_produced": [
    "packages/e2e/package.json",
    "e2e/support/world.ts",
    "e2e/support/hooks.ts",
    "e2e/features/smoke.feature",
    "e2e/step-definitions/smoke.steps.ts",
    "scripts/start-preview.sh",
    "scripts/ci.sh"
  ],
  "missing_accessors": [
    {
      "testid": "mf-ready-home",
      "app": "apps/home",
      "probable_file": "src/Home.tsx",
      "blocking": true,
      "status": "missing"
    }
  ]
}
```

End with `SETUP_DONE` or `SETUP_FAILED: [reason]`.
