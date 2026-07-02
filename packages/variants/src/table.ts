import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Resolves the DataTable row's opt-in hover state into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-table__row`, `.ui-table__row--hoverable`).
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
export const tableRowVariants = cva('ui-table__row', {
  variants: {
    hoverable: {
      true: 'ui-table__row--hoverable',
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
 * BEM block class for the `<table>` element (`.ui-table` in the skin).
 */
export const UI_TABLE_CLASS = 'ui-table'

/**
 * BEM class for the virtualized `<table>` (`.ui-table` + the `--virtualized` modifier, whose
 * `::after` reserves the off-screen rows' height via the `--pseudo-height` custom property).
 */
export const UI_TABLE_VIRTUALIZED_CLASS = 'ui-table ui-table--virtualized'

/**
 * BEM element class for the paginated table's scroll wrapper (`.ui-table__scroll` — a relative,
 * overflow-auto viewport; the virtualized table has none).
 */
export const UI_TABLE_SCROLL_CLASS = 'ui-table__scroll'

/**
 * BEM element class for the `<thead>` section (`.ui-table__header`).
 */
export const UI_TABLE_HEADER_CLASS = 'ui-table__header'

/**
 * BEM element class for the `<tbody>` section (`.ui-table__body`).
 */
export const UI_TABLE_BODY_CLASS = 'ui-table__body'

/**
 * BEM element class for the `<tfoot>` section (`.ui-table__footer`).
 */
export const UI_TABLE_FOOTER_CLASS = 'ui-table__footer'

/**
 * BEM element class for the `<th>` header cell (`.ui-table__head`).
 */
export const UI_TABLE_HEAD_CLASS = 'ui-table__head'

/**
 * BEM element class for the `<td>` data cell (`.ui-table__cell`).
 */
export const UI_TABLE_CELL_CLASS = 'ui-table__cell'

/**
 * BEM element class for the `<caption>` element (`.ui-table__caption`).
 */
export const UI_TABLE_CAPTION_CLASS = 'ui-table__caption'
