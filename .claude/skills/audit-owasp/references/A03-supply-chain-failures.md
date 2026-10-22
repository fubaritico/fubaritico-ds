# A03:2025 — Software Supply Chain Failures

OWASP Top 10 #3 (new). Compromised or vulnerable dependencies, build and release pipeline.

**In this repository**: the most relevant category — the DS is itself a dependency of other projects
(europe-map), so a compromise here propagates to every consumer.

## Checklist

### Critical

#### OWASP-A03-001: Known-vulnerable dependency
- **Where**: every `package.json`, `pnpm-lock.yaml`
- **Check**: `pnpm audit --prod` on the published packages; a high/critical advisory reachable at runtime

#### OWASP-A03-002: Lockfile not enforced in CI
- **Where**: `.github/actions/setup`, `.github/workflows/*`
- **Check**: CI installs with `--frozen-lockfile`

### High

#### OWASP-A03-003: Third-party action not pinned
- **Where**: `.github/workflows/*.yml`, `.github/actions/*`
- **Check**: actions outside `actions/*` pinned to a full commit SHA; `actions/*` at least to a major tag

#### OWASP-A03-004: Runtime dependency a consumer does not need
- **Where**: `dependencies` / `peerDependencies` of the published packages
- **Check**: `behaviors` has zero dependencies, `variants` only `class-variance-authority`; test and build
  tools stay in `devDependencies`; `shared` never a runtime dependency of `@fubaritico/react`

#### OWASP-A03-005: Install scripts
- **Where**: every `package.json`; `pnpm-workspace.yaml` (`onlyBuiltDependencies`)
- **Check**: no `preinstall`/`postinstall` in published packages; dependency build scripts allowed by name only

### Medium

#### OWASP-A03-006: Version drift outside the catalog
- **Where**: `package.json` files, `pnpm-workspace.yaml` `catalog:`
- **Check**: shared tooling on `catalog:` (vitest, playwright, react); no loose `^` range that can split a
  version across packages

#### OWASP-A03-007: Peer ranges too narrow or too wide
- **Where**: `peerDependencies` of `@fubaritico/react`
- **Check**: real ranges (`>=19`), not an exact version resolved through `catalog:`
