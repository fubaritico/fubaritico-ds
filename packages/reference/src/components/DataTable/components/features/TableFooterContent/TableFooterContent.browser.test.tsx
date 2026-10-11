import { render, screen } from '@testing-library/react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Card } from '../../../../Card'
import { Modal } from '../../../../Modal'

import { TableFooterContent } from './TableFooterContent'

// Real Chromium: the top layer, a real `<dialog>` and its inertness — none of it exists under jsdom.

const DATA = Array.from({ length: 100 }, (_, index) => ({ id: index }))
const COLUMNS = [createColumnHelper<{ id: number }>().accessor('id', {})]

/**
 * A Modal holding a clipping Card with the footer of a 100-row table.
 *
 * @returns The fixture.
 */
function InModal() {
  const [open, setOpen] = useState(true)
  const table = useReactTable({
    data: DATA,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  return (
    <Modal
      isOpen={open}
      onClose={() => {
        setOpen(false)
      }}
      aria-label="Table"
    >
      <Card style={{ inlineSize: '480px' }}>
        <TableFooterContent tableStateManager={table} />
      </Card>
    </Modal>
  )
}

const trigger = () =>
  screen.getByRole('button', { name: 'Select rows per page' })

describe('TableFooterContent (browser)', () => {
  describe('happy path', () => {
    it('inside a Modal: the rows-per-page menu opens in place and changes the page size', async () => {
      render(<InModal />)
      expect(screen.getByText('of 10')).toBeInTheDocument()
      await userEvent.click(trigger())

      const menu = document.querySelector<HTMLElement>('.ui-dropdown__menu')
      expect(menu?.matches(':popover-open')).toBe(true)
      expect(menu?.closest('dialog')).not.toBeNull()

      await userEvent.click(screen.getByRole('option', { name: '50' }))
      expect(screen.getByText('of 2')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('inside a Modal: Escape closes the menu only', async () => {
      render(<InModal />)
      await userEvent.click(trigger())
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
    })
  })

  // L2, L4, L5: covered by the DataTable suites — this file only proves the menu works in a Modal.
})
