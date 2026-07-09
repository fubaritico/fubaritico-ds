import {
  UI_TABLE_FOOTER_BAR_CLASS,
  UI_TABLE_FOOTER_GROUP_CLASS,
  UI_TABLE_FOOTER_LABEL_CLASS,
  UI_TABLE_PAGE_INPUT_CLASS,
} from '@fubaritico-ds/variants'

import { Dropdown } from '../../../../Dropdown'
import { Input } from '../../../../Input'
import { Pagination } from '../../../../Pagination'
import { MIN_PAGE_SIZE } from '../../../DataTable.constants'

import type { DropdownOption } from '../../../../Dropdown'
import type { BaseDataTableProps } from '../../../DataTable.types'

/** Props of {@link TableFooterContent}. */
export type TableFooterContentProps<TData> = Pick<
  BaseDataTableProps<TData>,
  'tableStateManager'
>

/** Rows-per-page choices (10, 20, 30, 40, 50). */
const PAGE_SIZE_OPTIONS: DropdownOption[] = [1, 2, 3, 4, 5].map((factor) => {
  const size = String(MIN_PAGE_SIZE * factor)
  return { value: size, label: size }
})

/**
 * Pagination controls rendered below the table: a rows-per-page selector (DS {@link Dropdown},
 * replacing the original `DropdownMenu`), the {@link Pagination} navigator, and a "go to page" field.
 * All driven by the injected table state manager. Meant to be hosted inside the semantic `TableFooter`
 * (`<tfoot>`) primitive.
 *
 * @param props - {@link TableFooterContentProps}.
 * @returns The table footer content.
 */
export function TableFooterContent<TData>({
  tableStateManager,
}: TableFooterContentProps<TData>) {
  const handleChangePage = (newPageIndex: number) => {
    tableStateManager.setPageIndex(newPageIndex)
  }

  return (
    <div className={UI_TABLE_FOOTER_BAR_CLASS} data-test="table-footer">
      {/* ROWS PER PAGE SELECTOR */}
      <div className={UI_TABLE_FOOTER_GROUP_CLASS}>
        <Dropdown
          aria-label="Select rows per page"
          buttonVariant="outline"
          withPortal
          options={PAGE_SIZE_OPTIONS}
          selectedValue={tableStateManager
            .getState()
            .pagination.pageSize.toString()}
          onSelect={(value) => {
            tableStateManager.setPageSize(parseInt(value, 10))
          }}
        />
        <span className={UI_TABLE_FOOTER_LABEL_CLASS}>Rows per page</span>
      </div>

      {tableStateManager.getRowCount() >
      tableStateManager.getState().pagination.pageSize ? (
        <>
          {/* PAGINATION NAVIGATOR */}
          <Pagination
            canNextPage={tableStateManager.getCanNextPage()}
            canPreviousPage={tableStateManager.getCanPreviousPage()}
            countPages={tableStateManager.getPageCount()}
            currentPage={tableStateManager.getState().pagination.pageIndex}
            gotoFirst={() => {
              tableStateManager.firstPage()
            }}
            gotoLast={() => {
              tableStateManager.lastPage()
            }}
            gotoNext={() => {
              tableStateManager.nextPage()
            }}
            gotoPrevious={() => {
              tableStateManager.previousPage()
            }}
            handleChangePage={handleChangePage}
          />

          {/* FIELD TO NAVIGATE TO A PAGE — a single wrapping label groups "Page … of N" so the input's
              accessible name is the whole phrase; the label wraps the input (implicit association, no id). */}
          <label className={UI_TABLE_FOOTER_GROUP_CLASS} data-test="go-to-page">
            <span className={UI_TABLE_FOOTER_LABEL_CLASS}>Page</span>
            <Input
              type="number"
              size="sm"
              min={1}
              max={tableStateManager.getPageCount()}
              value={tableStateManager.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                tableStateManager.setPageIndex(page)
              }}
              className={UI_TABLE_PAGE_INPUT_CLASS}
            />
            <span
              className={UI_TABLE_FOOTER_LABEL_CLASS}
              data-test="number-of-pages"
            >
              of {tableStateManager.getPageCount()}
            </span>
          </label>
        </>
      ) : null}
    </div>
  )
}

export default TableFooterContent
