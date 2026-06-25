import { Profiler } from 'react'

import DataTableExample, {
  makeJobs,
} from '@fubaritico-ds/reference/DataTableExample'

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
        <Story />
      </Profiler>
    ),
  ],
  parameters: {
    // The table needs width — override the global `centered` layout for this benchmark.
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '**Benchmark harness — 150 000 rows.** Renders the virtualized `DataTableVirtualized`',
          'through the `DataTableExample` container (the DI seam: the TanStack table instance is',
          'built in the container and injected into the presentational table).',
          '',
          '> ⚠️ The DataTable is **not yet migrated to the BEM skin** (still Tailwind `tw-*`). This',
          '> story imports the CSS-free subpath, so it renders **unstyled but functional** — the',
          '> benchmark measures behaviour (scroll, select-all), not visuals. The skin lands next.',
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
