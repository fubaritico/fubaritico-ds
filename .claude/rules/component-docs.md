# Rules — Component Documentation Plan

> **Every** design-system component ships a usage doc — no component is "done" without it (same
> status as its story and tests). The doc reads like a DS README (MUI / Headless UI / Radix): prose +
> copy-pastable examples + props + a11y + consumer-facing notes.

## Format & location

- A **co-located `README.md`** in the component's own directory:
  `packages/reference/src/<Component>/README.md` — a standalone README next to the code, NOT a
  Storybook page (Storybook's `autodocs` "Doc" tab already covers the live/interactive view; this is
  the authored reference that travels with the component).
- Written as **plain Markdown** — fenced ` ```tsx ` code blocks (it does not import the stories).
- Code samples must be **copy-pastable** and import from the CSS-free subpath
  `@fubaritico-ds/reference/<Component>` (never the Tailwind-leaking barrel — see the `story` skill).

## Mandatory plan (in this order)

Every doc page MUST contain these sections. A section that genuinely doesn't apply is kept with a
one-line `> N/A — <reason>` note (mirrors the 5-level test policy), never silently dropped.

1. **Title + identity** — the component name and ONE sentence: what it is and its
   **presentational/headless identity** (e.g. "neutral, semantic, polymorphic text primitive").
2. **Capabilities** — what it can DO (the asset): states, interactions, keyboard, focus, a11y,
   composition/slots, and the variant/size API. This is the headless-mindset section — lead with
   behaviour, not styling.
3. **Import** — the exact CSS-free subpath import line.
4. **Basic usage** — the simplest real example as a ` ```tsx ` code block.
5. **Variants & options** — one example **per meaningful variant / size / state**, each with code.
   Mirrors test Level 2.
6. **Edge cases** — boundary / unusual-but-valid usage shown as code: polymorphism (`as`),
   empty/very-long content, special inputs, single-vs-many. Mirrors test Level 5.
7. **Props / API reference** — a prop table (name · type · default · description). Every public prop
   documented (the component JSDoc is the source of truth — keep it strict and in sync).
8. **Accessibility** — roles, required ARIA, keyboard model, and **traps** the consumer must handle
   (e.g. `as="label"` requires `htmlFor`; `noWrap` truncation needs a `title`).
9. **Notes** — consumer-facing callouts, written **for whoever uses the component**, not for us. One
   `> **Note**` (or `> **Warning**`) block per point of attention: an exception to the usual API, a
   risk of misusing it, a gotcha to avoid, a thing the component deliberately does NOT do. Surface the
   **consequence for the user**, not our internal rationale. Keep them short and actionable. Examples:
   - `> **Warning** — \`variant="label"\` renders a \`<span>\`. For a real form label use \`as="label"\` with a required \`htmlFor\`.`
   - `> **Note** — \`noWrap\` truncates with an ellipsis; provide a \`title\` so the full text stays accessible.`

## Enforcement

- `new-react-component` creates the `.mdx` from this plan as part of scaffolding a component.
- `/review` fails a component that has no doc page, or whose page omits a mandatory section (or a
  required `> N/A` note), or whose code samples don't compile against the public API.
