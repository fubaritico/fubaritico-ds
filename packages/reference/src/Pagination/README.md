# Pagination

A presentational, fully-controlled page navigator: first / previous arrows, a sliding window of up to
five page buttons, then next / last arrows.

## Capabilities

- **Fully controlled** — every piece of state (current page, page count, can-go-next/previous) is
  lifted to the parent. The component renders and emits intent (`goto*`, `handleChangePage`); it holds
  no state. This wires straight onto a table's pagination API (e.g. TanStack Table's
  `getCanNextPage()` / `nextPage()` / `setPageIndex()` / `getPageCount()`).
- **Sliding window** — shows at most five page buttons and slides them to keep the current page
  visible as you move through a large page count.
- **First / last jumps** — double-chevron arrows jump to the ends (rendered by overlapping two single
  chevrons — the icon set has no double-chevron).
- **Disabled edges** — the previous/first and next/last arrows disable at the boundaries; the active
  page button is disabled and carries `aria-current="page"`.

## Import

```tsx
import { Pagination } from '@fubaritico-ds/reference/Pagination'
```

## Basic usage

```tsx
<Pagination
  currentPage={pageIndex}
  countPages={pageCount}
  canPreviousPage={pageIndex > 0}
  canNextPage={pageIndex < pageCount - 1}
  gotoFirst={() => setPageIndex(0)}
  gotoPrevious={() => setPageIndex((p) => p - 1)}
  gotoNext={() => setPageIndex((p) => p + 1)}
  gotoLast={() => setPageIndex(pageCount - 1)}
  handleChangePage={(p) => setPageIndex(p)}
/>
```

## Variants & options

> N/A — Pagination has no visual variants/sizes; its appearance is fixed and driven entirely by state
> (current page + boundaries).

## Edge cases

```tsx
{
  /* Single page — arrows disabled, one page button */
}
;<Pagination
  countPages={1}
  currentPage={0}
  canPreviousPage={false}
  canNextPage={false} /* …callbacks */
/>

{
  /* Large count — window slides, only five buttons shown */
}
;<Pagination
  countPages={100}
  currentPage={42}
  canPreviousPage
  canNextPage /* …callbacks */
/>
```

## Props / API

| Prop               | Type                      | Description                            |
| ------------------ | ------------------------- | -------------------------------------- |
| `currentPage`      | `number`                  | Current page index (0-based).          |
| `countPages`       | `number`                  | Total number of pages.                 |
| `canPreviousPage`  | `boolean`                 | Enables the previous/first arrows.     |
| `canNextPage`      | `boolean`                 | Enables the next/last arrows.          |
| `gotoFirst`        | `() => void`              | Jump to the first page.                |
| `gotoPrevious`     | `() => void`              | Go to the previous page.               |
| `gotoNext`         | `() => void`              | Go to the next page.                   |
| `gotoLast`         | `() => void`              | Jump to the last page.                 |
| `handleChangePage` | `(value: number) => void` | Go to a specific page index (0-based). |

## Accessibility

- Each control is a `<button>` with a descriptive `aria-label` ("go to page N", "go to first page", …).
- The current page button has `aria-current="page"` and is disabled.
- Chevron glyphs are `aria-hidden` (the label carries the meaning).

## Notes

> **Note** — Page indices are **0-based** (`currentPage`, `handleChangePage`); the visible numbers are
> 1-based. Convert at the boundary if your data source is 1-based.

> **Note** — The component derives nothing from data: it never computes `canNextPage`/`countPages`
> itself. Feed those from your table/query state so the boundaries stay correct.
