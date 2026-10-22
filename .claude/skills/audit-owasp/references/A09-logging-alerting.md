# A09:2025 — Security Logging & Alerting Failures

OWASP Top 10 #9.

**In this repository**: a library does not log to a service. What matters: what it prints in the
consumer's console, and that the CI alerts on failure.

## Checklist

### Medium

#### OWASP-A09-001: Console output from a published package
- **Where**: `packages/*/src/**` (not tests)
- **Check**: never `console.log`; a `console.warn` / `console.error` names the component and the misuse,
  and never prints a prop value that could hold user data

#### OWASP-A09-002: A failure the CI does not surface
- **Where**: `.github/workflows/*.yml`
- **Check**: no `continue-on-error: true` on the gate; a skeleton workflow (`workflow_dispatch` only) is
  documented as such, not mistaken for a passing check
