# TruncatedText

A single line of text cut with an ellipsis, which reveals its full content in a tooltip **only when
it is actually cut off**. A text primitive that truncates; the typography is its context's.

## Capabilities

- **Measured, not assumed** — the cut is measured (the text overflows its box or not), on mount,
  when the text changes and whenever its box resizes. A text that fits is plain text: no tooltip,
  no tab stop.
- **Reveals on hover and keyboard focus** — while cut, the text becomes focusable (`tabIndex 0`) and
  shows the whole text in a `Tooltip`: after a short delay on hover, at once on keyboard focus.
  **Escape** dismisses it without moving focus; the pointer can rest on the bubble (WCAG 1.4.13).
  Driven by `useTooltip` / `TooltipService`.
- **No double reading** — assistive technology already reads the whole text (the cut is visual,
  the DOM is not cut), so the bubble is `aria-hidden` and the text carries no `aria-describedby`.
- **Inherits its typography** — font, size and colour come from where it sits (a cell, a heading,
  a badge). The skin only cuts.
- **Valid anywhere text goes** — the bubble is a `<span>`, so the component is valid inside a `<p>`
  or a `<td>`; `as` picks the element of the text itself.
- **Override vars** — `--ui-truncated-text-display`, `-max-inline-size`, `-overflow` (the cut
  marker), `-cursor`, the focus ring (`-ring-color`, `-ring-width`, `-ring-offset`) and the corner API
  (`-radius`, `-radius-start-start` …).

## Import

```tsx
import { TruncatedText } from '@fubaritico/react/TruncatedText'
```

## Basic usage

The container bounds the width; the text cuts to it.

```tsx
<div style={{ inlineSize: 180 }}>
  <TruncatedText>
    The Holy Roman Empire of the German Nation, from 962 to 1806
  </TruncatedText>
</div>
```

## Variants & options

```tsx
// The element of the text: span (default), p or div.
<TruncatedText as="p">{longText}</TruncatedText>

// The tooltip: placement (it still flips when out of room) and look.
<TruncatedText placement="bottom" tooltipVariant="light">{longText}</TruncatedText>

// A cut marker of your own, through the skin (import type { CSSProperties } from 'react').
<TruncatedText style={{ '--ui-truncated-text-overflow': '"…more"' } as CSSProperties}>
  {longText}
</TruncatedText>
```

## Edge cases

```tsx
// In a table cell: give the column a width (table-layout: fixed), or the cell grows to fit instead.
<table style={{ tableLayout: 'fixed' }}>
  <tbody>
    <tr>
      <td style={{ inlineSize: 140 }}>
        <TruncatedText>{longText}</TruncatedText>
      </td>
    </tr>
  </tbody>
</table>

// Inside a flex row: the item must be allowed to shrink below its content.
<div style={{ display: 'flex' }}>
  <TruncatedText style={{ flex: 1, minInlineSize: 0 }}>{longText}</TruncatedText>
  <Badge>New</Badge>
</div>

// A text that changes: re-measured, so it stops being revealable once it fits.
<TruncatedText>{selection ?? 'Nothing selected'}</TruncatedText>
```

## Props / API

Every other `<span>` attribute (and `ref`) passes through to the text element. Your `onFocus`,
`onBlur`, `onKeyDown`, `onPointerEnter` and `onPointerLeave` run first, then the tooltip's.

| Prop             | Type                     | Default  | Description                                              |
| ---------------- | ------------------------ | -------- | -------------------------------------------------------- |
| `children`       | `string`                 | —        | The text — shown, measured, and revealed in the tooltip. |
| `as`             | `'span' \| 'div' \| 'p'` | `'span'` | Element of the text.                                     |
| `placement`      | `TooltipPlacement`       | `'top'`  | Preferred tooltip placement; flips when out of room.     |
| `tooltipVariant` | `'dark' \| 'light'`      | `'dark'` | Look of the tooltip.                                     |

## Accessibility

- The full text is always in the DOM: screen readers read it whole, cut or not. The tooltip is for
  sighted mouse and keyboard users, and is `aria-hidden`.
- While cut, the text is a **tab stop** (`tabIndex 0`) so a keyboard user can reveal it; focus shows
  the bubble at once, Escape hides it. While it fits, it is not focusable.
- WCAG 1.4.13: the bubble is dismissible (Escape), hoverable and persistent (it stays while hovered
  or focused).
- The tab stop is a generic element (no role): a screen reader announces its text, which is the
  point. An ancestor with `overflow: hidden` may clip its focus ring; reduce
  `--ui-truncated-text-ring-offset` there.

## Notes

> **Warning** — the text only cuts if its box is **bounded**: a width on it or its container, a
> table column with `table-layout: fixed`, or `min-inline-size: 0` on a flex item. Unbounded, it just
> grows, and there is never anything to reveal.

> **Note** — in a long list or grid where many texts are cut, each one is a tab stop. If your
> component owns the focus (a grid with arrow-key navigation), pass your own `tabIndex`: it always
> wins, and keeping the cut text reachable — so its tooltip can be revealed — is then yours to do.

> **Warning** — on a **touch** screen there is no hover and usually no keyboard focus: the full text
> cannot be revealed there. Where the full value matters (an identifier, a name to compare), also
> make it reachable another way — a detail view, a row expansion, a copy action.

> **Note** — single line only. For a multi-line clamp (`line-clamp`), the measure would be the
> height, not the width: not supported yet.
