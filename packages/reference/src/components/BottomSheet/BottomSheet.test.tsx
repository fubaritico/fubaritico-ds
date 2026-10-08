import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import BottomSheet from './BottomSheet'

import type { ComponentProps } from 'react'

const renderBottomSheet = (props: Partial<ComponentProps<typeof BottomSheet>> = {}) =>
  render(
    <BottomSheet open onClose={vi.fn()} {...props}>
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

  it('should render overlay when overlay prop is true', () => {
    renderBottomSheet({ overlay: true })

    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
  })

  it('should not render overlay by default', () => {
    renderBottomSheet()

    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('false')
  })

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderBottomSheet({ onClose, overlay: true })

    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()

    if (!overlay) throw new Error('Overlay not found')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalledOnce()
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

  it('should animate on first open', () => {
    renderBottomSheet()

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui-bottom-sheet--animated')
  })

  it('should render in a portal', () => {
    renderBottomSheet()

    const portalRoot = document.getElementById('portal')
    expect(portalRoot).toBeInTheDocument()
    expect(portalRoot?.querySelector('[role="dialog"]')).toBeInTheDocument()
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

    it('leaves the outside click to the scrim when an overlay is shown', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      const { container } = render(
        <BottomSheet open overlay onClose={onClose} aria-label="Filters">
          <BottomSheet.Body>Content</BottomSheet.Body>
        </BottomSheet>
      )

      expect(
        container.ownerDocument.querySelector('.ui-bottom-sheet__overlay')
      ).not.toBeNull()

      await user.click(document.body)

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
