import { Profiler, useState } from 'react'

import { Badge } from '@fubaritico/react/Badge'
import { Button } from '@fubaritico/react/Button'
import {
  ClickableCellView,
  IconStatusCellView,
  LabelWithTooltipCellView,
} from '@fubaritico/react/DataTable'
import DataTableExample, { makeJobs } from '@fubaritico/react/DataTableExample'
import { Icon } from '@fubaritico/react/Icon'
import { Modal } from '@fubaritico/react/Modal'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ProfilerOnRenderCallback } from 'react'

/**
 * Number of synthetic rows fed to the virtualized table — the perf target.
 */
const ROW_COUNT = 150_000

/** Fixed viewport height (px) for the virtualized scroll area. */
const VIEWPORT_HEIGHT = 600

/**
 * Built once at module load (deterministic factory) and shared by both benchmark stories so the
 * comparison isolates the only difference: whether the select-all toggle runs inside a transition.
 */
const data = makeJobs(ROW_COUNT)

/** Dataset for the paginated story — 754 rows (76 pages at the default page size), cheap to build. */
const paginatedData = makeJobs(754)

/** Six rows — fewer than the page size (10), so the pagination bar stays hidden. */
const sixRowsData = makeJobs(6)

/**
 * Capped height (px) of the paginated scroll area — set BELOW one page's height (10 rows) so the body
 * overflows and scrolls under the pinned header, demonstrating the sticky-header + `overflow: auto` fix.
 */
const PAGINATED_MAX_HEIGHT = 320

/**
 * Commits faster than this (ms) are skipped — keeps the scroll's tiny virtualizer commits out of
 * the console so only the heavy selection/sort commits are logged.
 */
const PROFILER_LOG_THRESHOLD_MS = 16

/**
 * Logs the React render+commit cost of each significant commit. Combined with the container's
 * `debugTimings` (total click → painted), it attributes the latency: React work vs browser paint.
 */
const onProfilerRender: ProfilerOnRenderCallback = (
  _id,
  phase,
  actualDuration
) => {
  if (actualDuration < PROFILER_LOG_THRESHOLD_MS) return
  console.warn(`[DataTable] render: ${actualDuration.toFixed(1)}ms (${phase})`)
}

const meta = {
  title: 'Reference/DataTable',
  component: DataTableExample,
  tags: ['autodocs'],
  decorators: [
    // Wrap the WHOLE container so the Profiler captures DataTableExample's own render (where the
    // 150k-key selection object is built + useReactTable re-processes), not just the table subtree.
    (Story) => (
      <Profiler id="DataTable" onRender={onProfilerRender}>
        <div
          style={{
            minHeight: '100vh',
            boxSizing: 'border-box',
            padding: 24,
            background: 'var(--color-surface-sunken)',
          }}
        >
          <Story />
        </div>
      </Profiler>
    ),
  ],
  parameters: {
    // The table needs width — override the global `centered` layout for this benchmark.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '**DataTable** — the virtualized `DataTableVirtualized` and paginated `DataTable`, both',
          'rendered through the `DataTableExample` container (the DI seam: the TanStack table instance',
          'is built in the container and injected into the presentational table). Wears the native BEM',
          'skin (`@fubaritico/styles`, the `ui-data-table` namespace).',
          '',
          '**How to benchmark:** scroll the body (only visible rows mount), toggle one row, then',
          'use the header checkbox to **select-all / deselect-all** all 150 000 rows. Compare',
          '`Benchmark150k` (direct) against `Benchmark150kTransition` (select-all wrapped in',
          '`startTransition`) — the latter keeps the UI responsive during the mass toggle.',
        ].join('\n'),
      },
    },
  },
  args: {
    data,
    locale: 'en_US',
    loading: false,
    virtualized: true,
    height: VIEWPORT_HEIGHT,
    enableRowSelection: true,
    debugTimings: true,
  },
  argTypes: {
    data: { table: { disable: true } },
    virtualized: { table: { disable: true } },
    maxHeight: { table: { disable: true } },
    stickyHeader: { table: { disable: true } },
    initTableAt: { table: { disable: true } },
  },
} satisfies Meta<typeof DataTableExample>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Direct select-all: the row-selection state update runs on the blocking render path.
 */
export const Benchmark150k: Story = {
  args: { useTransitionForSelection: false },
}

/**
 * Select-all wrapped in `startTransition` — the heavy 150k-key state update is deprioritised so the
 * checkbox/scroll stay responsive.
 */
export const Benchmark150kTransition: Story = {
  args: { useTransitionForSelection: true },
}

/**
 * Paginated table with a sticky header. `maxHeight` caps the scroll area below one page's height, so
 * the body scrolls (`overflow: auto`) while the `<thead>` stays pinned to the top on vertical scroll
 * and follows the columns on horizontal scroll (single `<table>` → header/body never drift). The
 * pagination bar sits OUTSIDE the scroll region, always visible below.
 */
export const PaginatedSticky: Story = {
  args: {
    data: paginatedData,
    virtualized: false,
    stickyHeader: true,
    maxHeight: PAGINATED_MAX_HEIGHT,
    enableRowSelection: false,
    debugTimings: false,
  },
}

/**
 * Six rows — fewer than the page size (10), so the pagination bar is hidden and every row shows at once.
 */
export const FewRows: Story = {
  args: {
    data: sixRowsData,
    virtualized: false,
    enableRowSelection: false,
    debugTimings: false,
  },
}

/**
 * Empty dataset — the table renders its `NoResults` empty state; no pagination bar.
 */
export const Empty: Story = {
  args: {
    data: [],
    virtualized: false,
    enableRowSelection: false,
    debugTimings: false,
  },
}

/** Width (px) of the table in the modal — narrow enough that names, dates and headers get cut. */
const MODAL_TABLE_WIDTH = 760

/**
 * A button opening the paginated table in a Modal.
 *
 * @returns The trigger and its modal.
 */
function TableInModal() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open the table in a modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        aria-label="Jobs"
      >
        <div style={{ inlineSize: MODAL_TABLE_WIDTH, maxInlineSize: '90vw' }}>
          <DataTableExample
            data={paginatedData}
            locale="en_US"
            loading={false}
            virtualized={false}
            enableRowSelection={false}
            debugTimings={false}
          />
        </div>
      </Modal>
    </>
  )
}

/**
 * The table inside a Modal (`<dialog>`, top layer). Hover or Tab onto a cut-off name, date or
 * header: the tooltip opens ABOVE the modal. Escape closes the tooltip only — a second Escape closes
 * the modal. The column filter and page-size menus open in the top layer too.
 */
export const InModal: Story = {
  parameters: { controls: { disable: true }, layout: 'centered' },
  render: () => <TableInModal />,
}

/** Width (px) of each column of the hint-cells table — cuts the long badge label. */
const HINT_COLUMN_WIDTH = 140

/** Header labels of the hint-cells table. */
const HINT_HEADERS = [
  'Label + hint',
  'Status + hint',
  'Action + hint',
  'Badge (truncate)',
]

/**
 * The cells that show a hint or a cut-off text in a tooltip, in a fixed-width table. First row:
 * every cell has something to reveal (each is one Tab stop). Second row: short values and no hints —
 * nothing to reveal, no tab stop, no bubble (only the button stays focusable).
 */
export const TooltipCells: Story = {
  parameters: { controls: { disable: true }, layout: 'centered' },
  render: () => (
    // `.ui-data-table` carries the grid's vars, as the Card of a real DataTable does.
    <div className="ui-data-table">
      <table
        className="ui-data-table__table"
        style={{ inlineSize: HINT_COLUMN_WIDTH * HINT_HEADERS.length }}
      >
        <thead>
          <tr className="ui-data-table__row">
            {HINT_HEADERS.map((header) => (
              <th key={header} className="ui-data-table__head">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="ui-data-table__row">
            <LabelWithTooltipCellView
              value="HRE"
              tooltipText="Holy Roman Empire, 962–1806"
            />
            <IconStatusCellView
              status="Failed"
              tooltipText="Disk full on node 3"
            />
            <ClickableCellView
              content={<Icon name="XMark" size={20} />}
              ariaLabel="Delete job 42"
              tooltipText="Removes the job for good"
              onClick={() => {
                console.warn('[TooltipCells] delete job 42')
              }}
            />
            <td className="ui-data-table__cell">
              <Badge icon="ExclamationTriangle" canTruncate>
                Waiting for an upstream dependency
              </Badge>
            </td>
          </tr>
          <tr className="ui-data-table__row">
            <LabelWithTooltipCellView value="FR" />
            <IconStatusCellView status="Completed" />
            <ClickableCellView
              content={<Icon name="XMark" size={20} />}
              ariaLabel="Delete job 43"
              onClick={() => {
                console.warn('[TooltipCells] delete job 43')
              }}
            />
            <td className="ui-data-table__cell">
              <Badge canTruncate>Done</Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
}
