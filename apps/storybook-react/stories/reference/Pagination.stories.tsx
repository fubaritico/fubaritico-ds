import { useState } from 'react'

// Pagination — CSS-free subpath (no Tailwind leak in Storybook).
import { Pagination } from '@fubaritico-ds/reference/Pagination'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Pagination — a presentational, fully-controlled page navigator (first/previous arrows, a sliding
 * window of page buttons, next/last arrows). All state is lifted to the parent. Skin classes come
 * from `@fubaritico-ds/variants` → `.ui-pagination`.
 */
const meta = {
  title: 'Reference/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    countPages: { control: { type: 'number', min: 1 } },
    currentPage: { table: { disable: true } },
    gotoFirst: { table: { disable: true } },
    gotoLast: { table: { disable: true } },
    gotoNext: { table: { disable: true } },
    gotoPrevious: { table: { disable: true } },
    handleChangePage: { table: { disable: true } },
    canNextPage: { table: { disable: true } },
    canPreviousPage: { table: { disable: true } },
  },
  args: {
    // Required props — the stories drive real state via a wrapper, so these are placeholders.
    countPages: 10,
    currentPage: 0,
    canNextPage: true,
    canPreviousPage: false,
    gotoFirst: () => undefined,
    gotoLast: () => undefined,
    gotoNext: () => undefined,
    gotoPrevious: () => undefined,
    handleChangePage: () => undefined,
  },
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

/** Stateful wrapper so the controls actually paginate. */
function PaginationDemo({ countPages }: { countPages: number }) {
  const [page, setPage] = useState(0)
  const clamp = (p: number) => Math.max(0, Math.min(p, countPages - 1))
  return (
    <Pagination
      countPages={countPages}
      currentPage={page}
      canPreviousPage={page > 0}
      canNextPage={page < countPages - 1}
      gotoFirst={() => {
        setPage(0)
      }}
      gotoPrevious={() => {
        setPage((p) => clamp(p - 1))
      }}
      gotoNext={() => {
        setPage((p) => clamp(p + 1))
      }}
      gotoLast={() => {
        setPage(countPages - 1)
      }}
      handleChangePage={(p) => {
        setPage(clamp(p))
      }}
    />
  )
}

/** Interactive playground — change the page count and navigate. */
export const Playground: Story = {
  render: ({ countPages }) => <PaginationDemo countPages={countPages} />,
}

/** A few page-count scenarios. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PaginationDemo countPages={1} />
      <PaginationDemo countPages={3} />
      <PaginationDemo countPages={10} />
      <PaginationDemo countPages={100} />
    </div>
  ),
}
