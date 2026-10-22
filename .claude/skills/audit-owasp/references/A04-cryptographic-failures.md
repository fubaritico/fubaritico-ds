# A04:2025 — Cryptographic Failures

OWASP Top 10 #4. Weak or missing cryptography, exposed sensitive data.

**In this repository**: the DS stores and transmits nothing. What remains: generated identifiers and
secrets that could leak through code or logs.

## Checklist

### High

#### OWASP-A04-001: Hardcoded credential
- **Where**: all tracked files (except `.env*`, which are git-ignored)
- **Check**: no API key, token, password or private key literal (see A02-001)

### Medium

#### OWASP-A04-002: `Math.random()` where uniqueness matters
- **Where**: `packages/*/src/**` (ids for ARIA relations, keys)
- **Check**: ids come from React `useId()` (React) or a deterministic counter in the service; `Math.random()`
  is not a security issue here but a collision risk — report as `low` unless used for a secret

#### OWASP-A04-003: Insecure transport in config
- **Where**: workflows, Storybook config, `README.md` install instructions
- **Check**: `https://` registries and URLs; `http://localhost` is fine for local development only
