# A05:2025 — Injection

OWASP Top 10 #5. Untrusted data sent to an interpreter — for a component library, the interpreter is the
**browser**: HTML, URLs, CSS, regular expressions.

## Checklist

### Critical

#### OWASP-A05-001: Raw HTML from props
- **Where**: `packages/reference/src/**/*.tsx`, `packages/stencil/src/**/*.tsx`
- **Check**: no `dangerouslySetInnerHTML` (React) and no `innerHTML` / `outerHTML` / `insertAdjacentHTML`
  (Web Components) fed by a prop, a slot's text or an attribute; content is rendered as children or text

### High

#### OWASP-A05-002: `javascript:` URL through a prop
- **Where**: link-like components (`LinkButton`, router adapters, `Avatar` `src`, any `href`/`src` prop)
- **Check**: the component renders the consumer's URL as is (React escapes, it does not validate): flag a
  component that **builds** a URL from user text, or documents an `href` without saying the consumer owns it

#### OWASP-A05-003: CSS injection through a style prop
- **Where**: components accepting free-form CSS values (Skeleton `width`/`height`, colour props, ColorPicker)
- **Check**: values go through `style` object properties or CSS custom properties, never concatenated into
  a `<style>` text or a `cssText` string

#### OWASP-A05-004: Regular expression built from input (ReDoS)
- **Where**: `new RegExp(` in `packages/*/src/**` (e.g. `TypeaheadHighlight.tsx`, `shared/src/vite/*`)
- **Check**: user text is escaped before it enters a pattern (`escapeRegex`); no nested quantifier on input

### Medium

#### OWASP-A05-005: Shell injection in scripts and workflows
- **Where**: `.github/workflows/*.yml`, `.husky/*`, `scripts/*`, `publish*.sh`, Vite plugins
- **Check**: no `${{ github.event.* }}` (PR title, branch name) interpolated into a `run:` line — pass it
  through `env:`; no `exec`/`execSync` with interpolated input
