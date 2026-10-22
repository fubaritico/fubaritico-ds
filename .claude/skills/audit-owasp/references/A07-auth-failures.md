# A07:2025 — Identification & Authentication Failures

OWASP Top 10 #7.

**In this repository**: there is **no authentication** — no login, no session, no user. The only
credentials are those of the toolchain. Do not report missing auth flows.

## Checklist

### High

#### OWASP-A07-001: Over-scoped toolchain token
- **Where**: `.github/workflows/*.yml`, `README.md` (publishing section), `.claude/skills/*/` scripts
- **Check**: `GITHUB_TOKEN` used for publishing rather than a personal token; a local token documented with
  its minimum scope (`read:packages` to install, the SonarCloud user token for reading — see the tooling
  known-issues)

#### OWASP-A07-002: Token read from the wrong place
- **Where**: scripts reading credentials (`.claude/skills/trello/scripts/*`, `.claude/skills/sonar/*`)
- **Check**: credentials come from `.env.local` / the environment, are never echoed, and an absent token
  fails with a clear message (no silent anonymous call)
