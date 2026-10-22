# A10:2025 — Mishandling of Exceptional Conditions

OWASP Top 10 #10 (new). Errors that are swallowed, masked or leave a broken state.

**In this repository**: the rule is `rules/error-handling.md` — throw on misuse, stay silent on a declined
gesture, no fallback value without the dev's agreement.

## Checklist

### High

#### OWASP-A10-001: Swallowed error
- **Where**: `packages/*/src/**`, Vite plugins in `packages/shared/src/vite/`
- **Check**: no empty `catch {}`; no `catch` that returns a default value hiding the failure

#### OWASP-A10-002: Fallback value masking a broken contract
- **Where**: components, resolvers, behaviour services
- **Check**: an unknown variant, a missing required context or an invalid state throws or is a type error —
  not silently replaced by a default (`?? 'primary'` on an impossible input)

### Medium

#### OWASP-A10-003: Inconsistent state after a failure
- **Where**: behaviour services (`packages/behaviors/src/**`)
- **Check**: a rejected transition leaves the state unchanged; listeners are not notified of a half-applied
  change

#### OWASP-A10-004: Cleanup missing
- **Where**: effects, services with subscriptions, timers, observers, pointer capture
- **Check**: every subscription, listener, timer and `ResizeObserver` is released on unmount / destroy
