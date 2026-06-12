# Avatar

A circular media slot for a person or entity, composed from sub-components. You declare an ordered
list of **candidates** (image, initials, icon) inside `Avatar.Fallback`; the **resolution cascade**
renders the first viable one — image when it loads, else initials, else the icon.

## Capabilities

- **Resolution cascade** — `Avatar.Fallback` renders the **first viable candidate** in document order.
  Supports multiple image sources (e.g. gravatar → CDN → initials → icon).
- **Anti-flash** — while an image candidate is still loading it **blocks** later candidates, so the
  initials never flash before the image resolves. On error/empty it fails over to the next candidate.
- **Loading status** — `Avatar.Image` exposes `onLoadingStatusChange` (`idle`/`loading`/`loaded`/
  `error`) and an optional **render-prop child** for a custom loading visual (e.g. a skeleton).
- **Split contexts** — a _stable_ config context (`size`) trickles to `Avatar.Icon`; a _dynamic_
  cascade context coordinates resolution. A status change never re-renders the size consumers.
- **Typed icon** — `Avatar.Icon` `name` is typed (`IconName`) → autocompletion, can't be mistyped;
  it is infallible (always a valid last resort) and `aria-hidden`.
- **Single accessible name** — the root carries `role="img"` + `aria-label` across every tier.
- **Skinnable** — colours/footprint via overridable `--ui-avatar-*` CSS variables; size → BEM class.

## Import

```tsx
import { Avatar } from '@fubaritico-ds/reference/Avatar'
```

## Basic usage

```tsx
<Avatar aria-label="Jane Doe">
  <Avatar.Fallback>
    <Avatar.Image src="https://example.com/jane.jpg" />
    <Avatar.Initials>JD</Avatar.Initials>
    <Avatar.Icon />
  </Avatar.Fallback>
</Avatar>
```

## Variants & options

Initials-only (no image):

```tsx
<Avatar aria-label="Jane Doe" size="lg">
  <Avatar.Fallback>
    <Avatar.Initials>JD</Avatar.Initials>
  </Avatar.Fallback>
</Avatar>
```

Icon-only fallback:

```tsx
<Avatar aria-label="Unknown user">
  <Avatar.Fallback>
    <Avatar.Icon name="User" />
  </Avatar.Fallback>
</Avatar>
```

Custom loading visual via the render-prop — drop in a `Spinner` (or a `Skeleton`, or nothing):

```tsx
<Avatar aria-label="Jane Doe">
  <Avatar.Fallback>
    <Avatar.Image src={url}>
      {(status) => (status === 'loading' ? <Spinner size="sm" /> : null)}
    </Avatar.Image>
    <Avatar.Icon />
  </Avatar.Fallback>
</Avatar>
```

The `Spinner` centres in the avatar and inherits `currentColor` (`--ui-avatar-fg`). Use
`<Skeleton variant="circle" />` instead for a placeholder block — the choice is yours (headless).

React to the loading status:

```tsx
<Avatar.Image src={url} onLoadingStatusChange={(s) => console.warn(s)} />
```

Every size: `xs · sm · md · lg · xl · 2xl · 3xl` (on the root).

## Edge cases

Multiple image sources — the first that loads wins:

```tsx
<Avatar aria-label="Jane Doe">
  <Avatar.Fallback>
    <Avatar.Image src={gravatarUrl} />
    <Avatar.Image src={cdnUrl} />
    <Avatar.Initials>JD</Avatar.Initials>
    <Avatar.Icon />
  </Avatar.Fallback>
</Avatar>
```

Long initials are truncated to the first 2 characters: `<Avatar.Initials>JDS</Avatar.Initials>` → `JD`.

## Props / API reference

### `Avatar` (root)

| Prop         | Type                                         | Default | Description                                            |
| ------------ | -------------------------------------------- | ------- | ------------------------------------------------------ |
| `aria-label` | `string`                                     | —       | **Required.** Accessible name for the whole avatar.    |
| `size`       | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'\|'3xl'` | `'md'`  | Footprint + icon/initials scale; trickles via context. |
| `...rest`    | `ComponentProps<'div'>`                      | —       | Forwarded to the root element.                         |

### `Avatar.Image`

| Prop                    | Type                    | Default | Description                                                 |
| ----------------------- | ----------------------- | ------- | ----------------------------------------------------------- |
| `src`                   | `string \| null`        | —       | Image URL. Empty/null → yields to the next candidate.       |
| `alt`                   | `string`                | `''`    | Decorative by default (the root names the avatar).          |
| `onLoadingStatusChange` | `(status) => void`      | —       | Fires on each `idle`/`loading`/`loaded`/`error` transition. |
| `children`              | `(status) => ReactNode` | —       | Render-prop for the loading visual (shown while pending).   |

### `Avatar.Fallback`

| Prop       | Type        | Default | Description                                       |
| ---------- | ----------- | ------- | ------------------------------------------------- |
| `children` | `ReactNode` | —       | Ordered candidates; the first viable one renders. |

### `Avatar.Initials` · `Avatar.Icon`

| Prop       | Type       | Default  | Description                                        |
| ---------- | ---------- | -------- | -------------------------------------------------- |
| `children` | `string`   | —        | (Initials) text, truncated to 2 chars.             |
| `name`     | `IconName` | `'User'` | (Icon) typed icon name; reads `size` from context. |

## Accessibility

- The **root** carries the accessible name (`role="img"` + `aria-label`) in every tier.
- `Avatar.Image` is **decorative** (`alt=""` by default) — the root already names the avatar.
- `Avatar.Icon` is `aria-hidden`.

## Notes

> **Warning** — `aria-label` is **required** on `<Avatar>`: it is the only accessible name, and it must
> hold even when the image fails and a fallback renders.

> **Warning** — candidates (`Avatar.Image`, `Avatar.Initials`, `Avatar.Icon`) MUST live inside an
> `Avatar.Fallback` — they throw otherwise (a candidate has no meaning without the resolution cascade).

> **Note** — while an image candidate is loading, the cascade shows **nothing** (or your render-prop)
> rather than flashing the initials. Provide a loading visual via the `Avatar.Image` render-prop if you
> want a placeholder during the load.

> **Note** — `Avatar.Image` `alt` is decorative by default. Pass a meaningful `alt` only if you do NOT
> set the root `aria-label`, to avoid the name being announced twice.
