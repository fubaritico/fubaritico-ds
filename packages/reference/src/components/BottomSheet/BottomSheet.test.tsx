import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BottomSheet from './BottomSheet'

import type { ComponentProps } from 'react'

// jsdom implements `showModal` but not the Popover API: the non-modal sheet's `showPopover` is
// mocked with an `open` attribute side-effect, so the dialog is shown (and queryable) as in a
// browser. The top layer itself is covered by the browser suite.
const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('open', '')
})
const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  this.removeAttribute('open')
})
HTMLElement.prototype.showPopover = showPopoverMock
HTMLElement.prototype.hidePopover = hidePopoverMock
// The modal sheet: same side-effect, as in the Modal suite.
const showModalMock = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
})
HTMLDialogElement.prototype.showModal = showModalMock
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open')
})

const renderBottomSheet = (
  props: Partial<ComponentProps<typeof BottomSheet>> = {}
) =>
  render(
    <BottomSheet open onClose={vi.fn()} aria-label="Filters" {...props}>
      <BottomSheet.Header>Title</BottomSheet.Header>
      <BottomSheet.Body>Content</BottomSheet.Body>
    </BottomSheet>
  )

describe('BottomSheet', () => {
  it('should render when open', () => {
    renderBottomSheet()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderBottomSheet({ open: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderBottomSheet({ onClose })

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should call onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderBottomSheet({ onClose })

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should open as a modal dialog when overlay is set', () => {
    showModalMock.mockClear()
    renderBottomSheet({ overlay: true })

    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog).not.toHaveAttribute('popover')
    expect(showModalMock).toHaveBeenCalledOnce()
  })

  it('should open as a non-modal manual popover by default', () => {
    showPopoverMock.mockClear()
    renderBottomSheet()

    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('aria-modal')
    expect(dialog).toHaveAttribute('popover', 'manual')
    expect(showPopoverMock).toHaveBeenCalledOnce()
  })

  it('should apply dark variant classes', () => {
    renderBottomSheet({ variant: 'dark' })

    const dialog = screen.getByRole('dialog')
    // One modifier now carries both the dark background and foreground, through role vars.
    expect(dialog.className).toContain('ui-bottom-sheet--dark')
  })

  it('should apply light variant classes by default', () => {
    renderBottomSheet()

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui-bottom-sheet')
  })

  it('should chain a consumer onClick before its own handling', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderBottomSheet({ onClick })

    await user.click(screen.getByText('Content'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('should animate on first open', () => {
    renderBottomSheet()

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui-bottom-sheet--animated')
  })

  it('should render in place, not in a portal', () => {
    const { container } = renderBottomSheet()

    expect(container.querySelector('dialog.ui-bottom-sheet')).toBe(
      screen.getByRole('dialog')
    )
  })

  it('should render children in Header', () => {
    renderBottomSheet()

    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should render children in Body', () => {
    renderBottomSheet()

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should forward className to dialog element', () => {
    renderBottomSheet({ className: 'custom-class' })

    expect(screen.getByRole('dialog').className).toContain('custom-class')
  })

  it('should use ghost-dark variant on close button when dark', () => {
    renderBottomSheet({ variant: 'dark' })

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    // IconButton migrated to the native skin: ghost-dark now emits the BEM extension class.
    expect(closeBtn.className).toContain('ui-icon-button--ghost-dark')
  })

  it('should throw if Header is used outside BottomSheet', () => {
    expect(() => {
      render(<BottomSheet.Header>Orphan</BottomSheet.Header>)
    }).toThrow('BottomSheet.* must be used within <BottomSheet>')
  })

  describe('dismissal without an overlay', () => {
    it('closes on a click outside the panel', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <BottomSheet open onClose={onClose} aria-label="Filters">
          <BottomSheet.Body>Content</BottomSheet.Body>
        </BottomSheet>
      )

      await user.click(document.body)

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('ignores a click inside the panel', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <BottomSheet open onClose={onClose} aria-label="Filters">
          <BottomSheet.Body>
            <button type="button">Inside</button>
          </BottomSheet.Body>
        </BottomSheet>
      )

      await user.click(screen.getByRole('button', { name: 'Inside' }))

      expect(onClose).not.toHaveBeenCalled()
    })

    it('leaves the outside click to the backdrop when the sheet is modal', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <BottomSheet open overlay onClose={onClose} aria-label="Filters">
          <BottomSheet.Body>Content</BottomSheet.Body>
        </BottomSheet>
      )

      await user.click(document.body)

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
