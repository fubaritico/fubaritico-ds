# A02:2025 — Security Misconfiguration

OWASP Top 10 #2. Insecure defaults, verbose errors, unnecessary features.

**In this repository**: the configuration is the build, the CI, the published packages and the public
Storybook site (`deploy-storybook.yml`).

## Checklist

### Critical

#### OWASP-A02-001: A secret in a tracked file
- **Where**: every tracked file (`git ls-files`), `.github/workflows/*`, `.claude/**`
- **Check**: no token, key or password literal; secrets live in `.env` / `.env.local` (git-ignored) or in
  GitHub secrets (`secrets.*`). Tokens in use: `GITHUB_TOKEN`, `SONAR_TOKEN`, the Trello key/token

### High

#### OWASP-A02-002: Development artefacts in a published package
- **Where**: each publishable `package.json` (`files`, `publishConfig`)
- **Check**: `files` lists only `dist` (+ `src` for the CSS skin, `README.md`); no tests, stories, fixtures,
  `.env*` or source maps with absolute paths in the tarball (`pnpm pack --dry-run`)

#### OWASP-A02-003: Private package published by mistake
- **Where**: `packages/shared`, `packages/stencil`, the apps
- **Check**: `"private": true` on everything not meant for GitHub Packages

### Medium

#### OWASP-A02-004: Storybook site exposing more than the showcase
- **Where**: `apps/storybook-react/.storybook/*`, `deploy-storybook.yml`
- **Check**: no environment variable injected into the preview (`env` / `define` in `main.ts`) that holds a
  secret; the static build contains only the stories

#### OWASP-A02-005: Unsafe `.npmrc`
- **Where**: `.npmrc` files (root, packages), `.github/actions/setup`
- **Check**: no auth token literal — `${NODE_AUTH_TOKEN}` only; registry scoped to `@fubaritico`
