# Image

A ratio-locked media box with a progressive reveal: a blurred placeholder while loading, the real
picture fading in on decode, and a fallback when the source fails.

## Capabilities

- **No layout shift** — the frame is sized by `aspectRatio`, never by the picture's own box, so the
  swap from placeholder to image shifts nothing.
- **Blur placeholder** — pass a pre-generated `blurDataUrl`, or let `autoBlur` derive one from the
  source at runtime.
- **Lazy loading** — `loading="lazy"` defers the fetch until the frame approaches the viewport
  (`IntersectionObserver`, 50px margin).
- **Error fallback** — a muted photo glyph by default, or your own node via `fallback`.
- **Cache-aware** — an image already in the browser cache is detected on mount, so it never flashes
  the placeholder.
- **Load callbacks** — `onLoad` / `onError` report the lifecycle.
- **State hook for tests and styling** — the frame carries `data-state="loading|loaded|error"`.
- **Motion-aware** — the fade is dropped under `prefers-reduced-motion`.

> **N/A — responsive sources.** `Image` renders a single `<img src>`. For art direction or a
> `srcSet`/`sizes` strategy, pass them through: they land on the underlying element.

## Import

```tsx
import { Image } from '@fubaritico-ds/reference/Image'
```

## Basic usage

```tsx
<Image src="/poster.jpg" alt="Film poster" />
```

## Variants & options

Aspect ratios — the named ones, or any CSS ratio string:

```tsx
<Image src="/poster.jpg" alt="Poster" aspectRatio="2/3" />  {/* default */}
<Image src="/still.jpg" alt="Still" aspectRatio="16/9" />
<Image src="/avatar.jpg" alt="Portrait" aspectRatio="1/1" />
<Image src="/banner.jpg" alt="Banner" aspectRatio="21/9" />
```

A pre-generated blur placeholder — the cheapest option, no runtime work:

```tsx
<Image src="/poster.jpg" alt="Poster" blurDataUrl={poster.blurDataUrl} />
```

Deriving the blur at runtime instead:

```tsx
<Image
  src="/poster.jpg"
  alt="Poster"
  autoBlur
  blurSize={16}
  blurQuality={0.3}
/>
```

Lazy loading below the fold:

```tsx
<Image src="/poster.jpg" alt="Poster" loading="lazy" />
```

A custom fallback:

```tsx
<Image
  src={maybeBroken}
  alt="Poster"
  fallback={<Typography variant="body2">Image unavailable</Typography>}
/>
```

Reacting to the lifecycle:

```tsx
<Image
  src="/poster.jpg"
  alt="Poster"
  onLoad={markReady}
  onError={logBrokenAsset}
/>
```

## Edge cases

```tsx
{
  /* A broken source falls back instead of showing the browser's torn-image glyph */
}
;<Image src="/missing.jpg" alt="Missing" />

{
  /* A decorative image still needs alt — use the empty string, which is the a11y-correct form */
}
;<Image src="/texture.png" alt="" />

{
  /* Changing src resets the lifecycle: state returns to loading and any generated blur is dropped */
}
;<Image src={currentPoster} alt="Poster" autoBlur />

{
  /* Constrain the frame from the outside; it has no intrinsic width */
}
;<div style={{ inlineSize: '12rem' }}>
  <Image src="/poster.jpg" alt="Poster" />
</div>
```

## Props

| Name                     | Type                                                          | Default   | Description                                                  |
| ------------------------ | ------------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| `src`                    | `string`                                                      | —         | Source URL. **Required.**                                    |
| `alt`                    | `string`                                                      | —         | Alternative text; `''` for a decorative image. **Required.** |
| `aspectRatio`            | `'2/3' \| '16/9' \| '1/1' \| '4/3' \| '3/2'` or any CSS ratio | `'2/3'`   | Shape of the frame.                                          |
| `blurDataUrl`            | `string`                                                      | —         | Pre-generated base64 placeholder.                            |
| `autoBlur`               | `boolean`                                                     | `false`   | Derive the placeholder from `src` at runtime.                |
| `blurSize`               | `number`                                                      | `16`      | Canvas size for `autoBlur`; smaller means blurrier.          |
| `blurQuality`            | `number`                                                      | `0.3`     | JPEG quality for `autoBlur`, `0`–`1`.                        |
| `fallback`               | `ReactNode`                                                   | —         | Replaces the default glyph when the source fails.            |
| `loading`                | `'lazy' \| 'eager'`                                           | `'eager'` | Fetch strategy.                                              |
| `onLoad`                 | `() => void`                                                  | —         | Called once the source decodes.                              |
| `onError`                | `() => void`                                                  | —         | Called when the source fails.                                |
| …`ComponentProps<'img'>` | —                                                             | —         | Everything else lands on the `<img>`.                        |

## Accessibility

- `alt` is **required**. For a decorative image pass `alt=""`, which removes it from the
  accessibility tree — that is correct, whereas omitting `alt` entirely is not.
- The blur placeholder is `aria-hidden` with an empty `alt`: it is never announced.
- The default error fallback is a decorative glyph, also `aria-hidden`. If the image carried
  meaning, supply a `fallback` containing real text — a missing picture should not become silence.
- The fade-in is removed under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — `alt` is required but not policed. `alt="image"` or a filename is worse than
> useless; describe what the picture conveys, or pass `''` if it conveys nothing.

> **Note** — the frame has no intrinsic width. It fills its container and derives its height from
> `aspectRatio`; constrain the parent.

> **Note** — `autoBlur` reads the source through a canvas at runtime, so it is subject to CORS: a
> cross-origin image without permissive headers yields no placeholder (the component degrades
> quietly to the plain background). A pre-generated `blurDataUrl` has no such constraint — prefer it
> when your pipeline can produce one.

> **Note** — `loading` drives an `IntersectionObserver`, not the native `loading` attribute, so the
> behaviour is identical across browsers and testable.
