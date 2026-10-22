# A06:2025 — Insecure Design

OWASP Top 10 #6. Missing or ineffective security controls by design.

**In this repository**: design flaws a component library can ship — an unsafe default, a contract that
fails silently, or a misuse that cannot be detected.

## Checklist

### High

#### OWASP-A06-001: Unsafe default
- **Where**: component defaults (`*.types.ts`, default props)
- **Check**: the default is the safe option — e.g. a link opening a new tab is opt-in and carries `rel`; a
  destructive action button needs its explicit variant; a dialog traps focus and restores it on close

#### OWASP-A06-002: Misuse that fails silently
- **Where**: compound components, behaviour services
- **Check**: a broken contract throws (a slot outside its parent — `rules/error-handling.md`), it is not
  masked by a fallback value

### Medium

#### OWASP-A06-003: An accessibility gap that hides state
- **Where**: dialogs, menus, toasts
- **Check**: a state change the user must notice (an error, a destructive confirmation) is announced
  (`role="alert"`, `aria-live`), not only coloured
