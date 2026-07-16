# NextLinkButton

A Next.js `<Link>` (or a plain `<a>` for cross-zone navigation) wearing the **Button skin** — a thin
**routing adapter** around the Button presentational core. Same visual API as `Button`, rendered as a
link.

## Capabilities

- **Button visual API** — identical `variant`, `size`, `icon`, `iconPosition` props as `Button`.
- **Two navigation modes** via `as`:
  - `as="link"` (default) — a `next/link` for in-app, client-side navigation.
  - `as="zone-link"` — a plain `<a>` for **Next.js multi-zone** / cross-app navigation (full reload).
- **Renders a real link** — semantic `<a>` with `href`, exposing the `link` role.
- **Headless skin** — reuses the exact `buttonVariants` BEM resolver: both modes are pixel-identical
  to `Button` and to each other.
- **Server-safe** — marked `'use client'`; drop it into the App Router without extra wiring.

## Import

```tsx
import { NextLinkButton } from '@fubaritico-ds/reference/NextLinkButton'
```

## Basic usage

```tsx
<NextLinkButton href="/movies/278">View details</NextLinkButton>
```

## Variants & options

```tsx
<NextLinkButton href="/x" variant="outline" size="lg">
  Outline large
</NextLinkButton>

<NextLinkButton href="/next" icon="ArrowRight" iconPosition="right">
  Next
</NextLinkButton>
```

## Edge cases

```tsx
// Cross-zone navigation (separate Next app) — renders a plain <a>, full reload:
<NextLinkButton as="zone-link" href="https://other-zone.example.com/path">
  Go to other zone
</NextLinkButton>

// Merge a consumer className (appended after the skin classes):
<NextLinkButton href="/x" className="my-utility">
  Themed
</NextLinkButton>
```

## Props

| Prop           | Type                                                                | Default     | Description                                      |
| -------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `as`           | `'link' \| 'zone-link'`                                             | `'link'`    | `link` → `next/link`; `zone-link` → plain `<a>`. |
| `href`         | `string`                                                            | _required_  | Navigation URL. Required for `zone-link`.        |
| `variant`      | `'primary' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost'` | `'primary'` | Visual variant (shared with Button).             |
| `size`         | `'sm' \| 'md' \| 'lg'`                                              | `'md'`      | Size (shared with Button).                       |
| `icon`         | `IconName`                                                          | —           | Optional leading/trailing icon.                  |
| `iconPosition` | `'left' \| 'right'`                                                 | `'left'`    | Icon side relative to the label.                 |

Plus the props of the underlying element: `next/link` `LinkProps` for `as="link"`, native `<a>`
attributes (`ComponentProps<'a'>`) for `as="zone-link"`.

## Accessibility

- This is a **link**, not a button: `link` role, activated with **Enter**. Use it for navigation; use
  `Button` for actions.
- Keep visible `children` text as the accessible name — no icon-only links.
- For `zone-link` (full cross-app reload), make sure the destination is genuinely a separate zone;
  using it for in-app routes loses client-side navigation.

## Notes

> **Note** — `NextLinkButton` is the **Next.js** adapter. For React Router use `LinkButton`; for a
> non-navigating action use the plain `Button`. All three share the same skin.

> **Warning** — `as="zone-link"` renders a plain `<a>` and triggers a **full page reload**. Use it
> only for Next.js multi-zone boundaries, not for ordinary in-app links (which should stay `as="link"`).
