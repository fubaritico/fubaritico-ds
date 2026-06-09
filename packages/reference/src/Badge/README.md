# Badge

A small, non-interactive **status / label** primitive — a single inline `<span>` wearing the native
skin. Presentational only: it conveys meaning through its text, never through colour alone.

## Capabilities

- **Visual variants** — `default`, `secondary`, `outline`, `destructive`.
- **Sizes** — `sm`, `md`, `lg`.
- **Optional leading icon** — `icon` (an `IconName`), rendered decorative (`aria-hidden`); the meaning
  must still be carried by the `children` text.
- **Inline element** — renders a `<span>`, so it flows inside text and forwards every `<span>`
  attribute (`id`, `aria-*`, `onClick`, `ref`, `className`, …).
- **Headless skin** — variant/size resolve to BEM classes via `@fubaritico-ds/variants`; colours and
  paddings come from the overridable `--ui-badge-*` component variables.

## Import

```tsx
import { Badge } from '@fubaritico-ds/reference/Badge'
```

## Basic usage

```tsx
<Badge>New</Badge>
```

## Variants & options

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>

<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

<Badge icon="Star">Featured</Badge>
```

## Edge cases

```tsx
// Icon + text — the icon is decorative, the text carries the meaning:
<Badge icon="Check" variant="secondary">Verified</Badge>

// Merge a consumer className (appended after the skin classes):
<Badge className="my-utility">Themed</Badge>
```

## Props

| Prop      | Type                                                     | Default     | Description                                       |
| --------- | -------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'destructive'` | `'default'` | Visual variant.                                   |
| `size`    | `'sm' \| 'md' \| 'lg'`                                   | `'md'`      | Badge size.                                       |
| `icon`    | `IconName`                                               | —           | Optional decorative leading icon (`aria-hidden`). |

Plus all native `<span>` attributes (`ComponentProps<'span'>`, including `ref` and `className`).

## Accessibility

- The badge is **not interactive** — it carries no role. Don't use it as a button; for a clickable
  chip use a real control.
- Don't rely on **colour alone** to distinguish states (e.g. `destructive`). The text content must
  state the meaning, so colour-blind and screen-reader users get it too.

## Notes

> **Note** — the `icon` is **decorative** (`aria-hidden`): it adds no accessible name. Keep meaningful
> `children` text — a badge with only an icon reads as empty to assistive tech.
