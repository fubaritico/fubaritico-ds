# A01:2025 — Broken Access Control (incl. SSRF)

OWASP Top 10 #1. Users acting outside their intended permissions.

**In this repository**: a component library — no server, no session, no user data. Access control reduces to
the **CI's permissions** and to **links a component renders**. Report nothing for API routes or auth guards:
there are none.

## Checklist

### High

#### OWASP-A01-001: Workflow permissions wider than needed
- **Where**: `.github/workflows/*.yml`
- **Check**: a top-level or job-level `permissions:` block on every workflow; `contents: read` by default
- **Check**: `packages: write` / `contents: write` only on the job that publishes or tags (`release.yml`)

#### OWASP-A01-002: `pull_request_target` or untrusted checkout with secrets
- **Where**: `.github/workflows/*.yml`
- **Check**: no `pull_request_target` that checks out the PR head; no secret exposed to a fork's code

### Medium

#### OWASP-A01-003: Reverse tabnabbing
- **Where**: `packages/reference/src/**/*.tsx`, `packages/stencil/src/**/*.tsx`
- **Check**: an anchor with `target="_blank"` also sets `rel="noopener noreferrer"` (or the consumer's `rel`
  is merged, never dropped)

#### OWASP-A01-004: Component that fetches a URL it is given
- **Where**: components and `packages/shared/src/**`
- **Check**: a DS component never fetches on its own; an image `src` or a link `href` is rendered, not
  requested by code (no SSRF surface). Flag any `fetch()` in a published package
