import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves the DataTable row's opt-in hover state into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-data-table__row`, `.ui-data-table__row--hoverable`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework. The `selected`
 * state is NOT resolved here — TanStack sets `data-state="selected"` on the row element and the skin
 * styles off that attribute, so it needs no class.
 *
 * @param props - Row options (all optional — CVA defaults apply).
 * @param props.hoverable - When true, emit the hover-tint modifier; defaults to `false`.
 * @returns The space-separated BEM class string for the row.
 */
export const tableRowVariants = cva('ui-data-table__row', {
  variants: {
    hoverable: {
      true: 'ui-data-table__row--hoverable',
      false: '',
    },
  },
  defaultVariants: {
    hoverable: false,
  },
})

/** Variant props inferred from {@link tableRowVariants}. */
export type TableRowVariantProps = VariantProps<typeof tableRowVariants>

/**
 * BEM BLOCK class for the DataTable (`.ui-data-table`). Applied to the CONTAINER (the Card), not the
 * `<table>` — it wraps the toolbar, the `<table>` and the footer, and carries the component-scoped
 * `--ui-data-table-*` vars so every descendant (including the out-of-table toolbar/footer) inherits them.
 */
export const UI_DATA_TABLE_CLASS = 'ui-data-table'

/**
 * BEM element class for the `<table>` itself (`.ui-data-table__table`) — the box model / border-collapse
 * / layout live here, distinct from the block on the container.
 */
export const UI_DATA_TABLE_TABLE_CLASS = 'ui-data-table__table'

/**
 * BEM class for the virtualized `<table>` (`.ui-data-table__table` + the `--virtualized` modifier, whose
 * `::after` reserves the off-screen rows' height via the `--pseudo-height` custom property).
 */
export const UI_DATA_TABLE_VIRTUALIZED_CLASS =
  'ui-data-table__table ui-data-table__table--virtualized'

/**
 * BEM element class for the paginated table's scroll wrapper (`.ui-data-table__scroll` — a relative,
 * overflow-auto viewport; the virtualized table has none).
 */
export const UI_DATA_TABLE_SCROLL_CLASS = 'ui-data-table__scroll'

/**
 * BEM element class for the `<thead>` section (`.ui-data-table__header`).
 */
export const UI_DATA_TABLE_HEADER_CLASS = 'ui-data-table__header'

/**
 * BEM element class for the `<tbody>` section (`.ui-data-table__body`).
 */
export const UI_DATA_TABLE_BODY_CLASS = 'ui-data-table__body'

/**
 * BEM element class for the `<tfoot>` section (`.ui-data-table__footer`).
 */
export const UI_DATA_TABLE_FOOTER_CLASS = 'ui-data-table__footer'

/**
 * BEM modifier applied ALONGSIDE `.ui-data-table__header` to pin the `<thead>` to the scroll viewport top
 * (opt-in via `stickyHeader`; always on for the virtualized table).
 */
export const UI_DATA_TABLE_HEADER_STICKY_MODIFIER =
  'ui-data-table__header--sticky'

/**
 * BEM element class for the header `<tr>` (`.ui-data-table__header-row`) — a dedicated header-row style
 * (just the header/body divider), distinct from the body `.ui-data-table__row` which also carries the row
 * background, hover and selected-state styling.
 */
export const UI_DATA_TABLE_HEADER_ROW_CLASS = 'ui-data-table__header-row'

/**
 * BEM element class for the `<th>` header cell (`.ui-data-table__head`).
 */
export const UI_DATA_TABLE_HEAD_CLASS = 'ui-data-table__head'

/**
 * BEM element class for the `<td>` data cell (`.ui-data-table__cell`).
 */
export const UI_DATA_TABLE_CELL_CLASS = 'ui-data-table__cell'

/**
 * BEM element class for the `<caption>` element (`.ui-data-table__caption`).
 */
export const UI_DATA_TABLE_CAPTION_CLASS = 'ui-data-table__caption'

/* ---- cell content (cells layer) ---- */

/**
 * BEM modifier applied ALONGSIDE `.ui-data-table__head` for the "strong" header look (near-black + bold):
 * used by the Checkbox / Clickable / Empty header cells, distinct from the default muted header.
 */
export const UI_DATA_TABLE_HEAD_STRONG_MODIFIER = 'ui-data-table__head--strong'

/**
 * BEM element class for a header cell's inner flex layout (label + control + optional separator).
 */
export const UI_DATA_TABLE_HEAD_INNER_CLASS = 'ui-data-table__head-inner'

/**
 * BEM element class for the sortable column label (small, uppercase, muted, truncating).
 */
export const UI_DATA_TABLE_HEAD_LABEL_CLASS = 'ui-data-table__head-label'

/**
 * BEM element class for the sort-toggle hit area wrapping the {@link ArrowUpDown} control.
 */
export const UI_DATA_TABLE_SORT_TOGGLE_CLASS = 'ui-data-table__sort-toggle'

/**
 * BEM element class for the opt-in column separator (a thin vertical rule at the header's trailing
 * edge), rendered when a header cell is configured with `withSeparator`.
 */
export const UI_DATA_TABLE_SEPARATOR_CLASS = 'ui-data-table__separator'

/**
 * BEM element class for a data cell's generic inner flex layout (`display:flex; align-items:center`).
 */
export const UI_DATA_TABLE_CELL_INNER_CLASS = 'ui-data-table__cell-inner'

/**
 * BEM modifier applied ALONGSIDE `.ui-data-table__cell` to center the cell content (e.g. a status icon).
 */
export const UI_DATA_TABLE_CELL_CENTER_MODIFIER = 'ui-data-table__cell--center'

/**
 * BEM element class for a truncating wrapper (lets an inline child ellipsis-truncate inside a
 * flex/table context). Shared by the link cell and TruncatedContent.
 */
export const UI_DATA_TABLE_TRUNCATE_WRAP_CLASS = 'ui-data-table__truncate-wrap'

/**
 * BEM element class for a generic single-line ellipsis text child inside a truncating wrapper.
 */
export const UI_DATA_TABLE_TRUNCATE_CLASS = 'ui-data-table__truncate'

/**
 * BEM element class for the link cell anchor (neutral, underlined, truncating).
 */
export const UI_DATA_TABLE_LINK_CLASS = 'ui-data-table__link'

/**
 * BEM element class for the duration cell value (medium weight).
 */
export const UI_DATA_TABLE_DURATION_CLASS = 'ui-data-table__duration'

/**
 * BEM element class for visually-hidden text kept in the accessibility tree — used to give an
 * icon-only cell (e.g. a status icon, which is always decorative) an accessible name for screen
 * readers without showing it visually.
 */
export const UI_DATA_TABLE_VISUALLY_HIDDEN_CLASS =
  'ui-data-table__visually-hidden'

/* ---- chrome (features layer) ---- */

/**
 * BEM element class for the toolbar above the table (ActionBar): left actions + a global-filter field.
 */
export const UI_DATA_TABLE_TOOLBAR_CLASS = 'ui-data-table__toolbar'

/**
 * BEM modifier applied ALONGSIDE `.ui-data-table__toolbar` to pin it to the top while scrolling.
 */
export const UI_DATA_TABLE_TOOLBAR_STICKY_MODIFIER =
  'ui-data-table__toolbar--sticky'

/**
 * BEM element class for the toolbar's growing left-actions group (pushes the filter to the far edge).
 */
export const UI_DATA_TABLE_TOOLBAR_ACTIONS_CLASS =
  'ui-data-table__toolbar-actions'

/**
 * BEM element class for the toolbar's global-filter search field wrapper (fixed width).
 */
export const UI_DATA_TABLE_TOOLBAR_SEARCH_CLASS =
  'ui-data-table__toolbar-search'

/**
 * BEM element class for the empty-state box (NoResults) — a centered column filling a fixed-height row.
 */
export const UI_DATA_TABLE_EMPTY_CLASS = 'ui-data-table__empty'

/**
 * BEM element class for the footer bar (TableFooterContent): rows-per-page + pagination + go-to-page.
 */
export const UI_DATA_TABLE_FOOTER_BAR_CLASS = 'ui-data-table__footer-bar'

/**
 * BEM element class for an inline group inside the footer bar (a label next to a control).
 */
export const UI_DATA_TABLE_FOOTER_GROUP_CLASS = 'ui-data-table__footer-group'

/**
 * BEM element class for a secondary footer label ("Rows per page", "Go to page", "of N").
 */
export const UI_DATA_TABLE_FOOTER_LABEL_CLASS = 'ui-data-table__footer-label'

/**
 * BEM element class for the go-to-page number field (a lightly-skinned native input).
 */
export const UI_DATA_TABLE_PAGE_INPUT_CLASS = 'ui-data-table__page-input'
