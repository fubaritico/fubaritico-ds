# Avatar

A circular media slot that represents a person or entity — it resolves the best available
representation in order: the **image**, then the consumer **initials**, then a generic **User icon**.

## Capabilities

- **Three-tier fallback** — renders the image when `src` loads, the `initials` when there is no
  image, and the `User` icon when neither is available. The choice is automatic.
- **Graceful image failure** — if the image errors at runtime (`onError`), it drops to the next tier
  (initials, then icon) without layout shift.
- **Fixed square footprint** — the block always reserves its size, so a missing image never
  collapses the surrounding layout.
- **Size API** — `xs · sm · md · lg · xl · 2xl · 3xl`; each scales the footprint and the initials.
- **Skinnable** — colours, radius and footprint are driven by overridable `--ui-avatar-*` CSS
  variables (white-label); size resolves to a BEM class via the framework-agnostic resolver.
- **Attribute passthrough** — extra `<img>` attributes (`id`, `data-*`, `loading`, …) are forwarded
  to the image element when one is rendered.

## Import

```tsx
import { Avatar } from '@fubaritico-ds/reference/Avatar'
```

## Basic usage

```tsx
<Avatar src="https://example.com/jane.jpg" alt="Jane Doe" />
```

## Variants & options

Image avatar:

```tsx
<Avatar src="https://example.com/jane.jpg" alt="Jane Doe" size="lg" />
```

Initials fallback (no image):

```tsx
<Avatar alt="Jane Doe" initials="JD" />
```

Icon fallback (no image, no initials):

```tsx
<Avatar alt="Unknown user" />
```

Every size:

```tsx
<Avatar alt="Jane Doe" initials="JD" size="xs" />
<Avatar alt="Jane Doe" initials="JD" size="sm" />
<Avatar alt="Jane Doe" initials="JD" size="md" />
<Avatar alt="Jane Doe" initials="JD" size="lg" />
<Avatar alt="Jane Doe" initials="JD" size="xl" />
<Avatar alt="Jane Doe" initials="JD" size="2xl" />
<Avatar alt="Jane Doe" initials="JD" size="3xl" />
```

## Edge cases

A broken or unreachable image falls back automatically:

```tsx
<Avatar src="https://invalid.url/broken.jpg" alt="Jane Doe" initials="JD" />
```

Long initials are truncated to the first two characters:

```tsx
<Avatar alt="Jane Doe Smith" initials="JDS" /> {/* renders "JD" */}
```

A `null` or empty `src` is treated like a missing image:

```tsx
<Avatar src={null} alt="Jane Doe" initials="JD" />
```

## Props / API reference

| Prop        | Type                                         | Default | Description                                                              |
| ----------- | -------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `src`       | `string \| null`                             | —       | Image URL. When absent or it fails to load, the fallback is shown.       |
| `alt`       | `string`                                     | —       | **Required.** Alt text describing the person — even when no image shows. |
| `size`      | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'\|'3xl'` | `'md'`  | Footprint and initials scale.                                            |
| `initials`  | `string`                                     | —       | Initials fallback, truncated to the first 2 characters.                  |
| `className` | `string`                                     | —       | Merged onto the root element.                                            |
| `...rest`   | `ComponentProps<'img'>` (minus `src`)        | —       | Forwarded to the `<img>` element **only when an image is rendered**.     |

## Accessibility

- `alt` is **required** and describes the person.
- When an image renders, the `<img alt>` is the accessible name. When the initials or icon fallback
  renders, the **root element carries `role="img"` and `aria-label={alt}`**, so the avatar always
  exposes a meaningful name to assistive technology (the decorative icon stays `aria-hidden`).

## Notes

> **Note** — extra `img` attributes (`data-*`, `loading`, `id`, …) are forwarded to the `<img>` > **only when an image is rendered**. In the initials/icon fallback there is no `<img>`, so those
> attributes are not applied.

> **Note** — `initials` are truncated to the **first two characters**. Pass the two you want shown
> (e.g. `"JD"`), not a full name.

> **Warning** — the avatar reserves a fixed square footprint per `size`; it has no intrinsic content
> sizing. Overriding the footprint means redefining `--ui-avatar-size` (or the `size` prop), not
> width/height utilities on the child.
