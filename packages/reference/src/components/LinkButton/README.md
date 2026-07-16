# LinkButton

A React Router `<Link>` wearing the **Button skin** — a thin **routing adapter** around the Button
presentational core. Same visual API as `Button`, but it renders an anchor and navigates client-side.

## Capabilities

- **Button visual API** — identical `variant` (`primary` / `secondary` / `destructive` / `outline` /
  `ghost`), `size` (`sm` / `md` / `lg`), `icon` and `iconPosition` props as `Button`.
- **Client-side navigation** — wraps `react-router-dom`'s `<Link>`; takes `to` and every `<Link>`
  prop (`replace`, `state`, `reload`, …).
- **Renders a real link** — semantic `<a>` with an `href`, so it has the `link` role (not `button`).
- **Headless skin** — reuses the exact `buttonVariants` BEM resolver, so it stays pixel-identical to
  `Button` and re-skins with it.

## Import

```tsx
import { LinkButton } from '@fubaritico-ds/reference/LinkButton'
```

## Basic usage

```tsx
<LinkButton to="/movies/278">View details</LinkButton>
```

## Variants & options

```tsx
<LinkButton to="/x" variant="outline" size="lg">
  Outline large
</LinkButton>

<LinkButton to="/next" icon="ArrowRight" iconPosition="right">
  Next
</LinkButton>

// Replace history instead of pushing:
<LinkButton to="/x" replace>
  Replace
</LinkButton>
```

## Edge cases

```tsx
// Carry router state across navigation:
<LinkButton to="/details" state={{ from: 'list' }}>
  Open
</LinkButton>

// Merge a consumer className (appended after the skin classes):
<LinkButton to="/x" className="my-utility">
  Themed
</LinkButton>
```

## Props

| Prop           | Type                                                                | Default     | Description                          |
| -------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------ |
| `to`           | `To`                                                                | _required_  | React Router navigation target.      |
| `variant`      | `'primary' \| 'secondary' \| 'destructive' \| 'outline' \| 'ghost'` | `'primary'` | Visual variant (shared with Button). |
| `size`         | `'sm' \| 'md' \| 'lg'`                                              | `'md'`      | Size (shared with Button).           |
| `icon`         | `IconName`                                                          | —           | Optional leading/trailing icon.      |
| `iconPosition` | `'left' \| 'right'`                                                 | `'left'`    | Icon side relative to the label.     |

Plus all `react-router-dom` `<Link>` props (`replace`, `state`, `reload`, `ref`, `className`, …).

## Accessibility

- This is a **link**, not a button: it exposes the `link` role and is activated with **Enter** (not
  Space). Use it for navigation; use `Button` for actions (submit, toggle, mutate).
- The accessible name comes from `children` — keep visible text. Don't ship an icon-only link with no
  label.

## Notes

> **Note** — `LinkButton` is the **React Router** adapter. For Next.js use `NextLinkButton`; for a
> non-navigating action use the plain `Button`. They all share the same skin, so they look identical.

> **Warning** — it requires a `react-router-dom` `<Router>` ancestor at runtime. Outside a router
> context it throws; the plain `Button` has no such requirement.
