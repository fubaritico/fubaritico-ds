import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Drawer from './Drawer'

const renderDrawer = (
  props: Partial<React.ComponentProps<typeof Drawer>> = {}
) =>
  render(
    <Drawer open onClose={vi.fn()} {...props}>
      <Drawer.Header>Title</Drawer.Header>
      <Drawer.Body>Content</Drawer.Body>
    </Drawer>
  )

describe('Drawer', () => {
  it('should render when open', () => {
    renderDrawer()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderDrawer({ open: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDrawer({ onClose })

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should call onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDrawer({ onClose })

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should render overlay when overlay prop is true', () => {
    renderDrawer({ overlay: true })

    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
  })

  it('should not render overlay by default', () => {
    renderDrawer()

    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('false')
  })

  it('should call onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDrawer({ onClose, overlay: true })

    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()

    if (!overlay) throw new Error('Overlay not found')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should apply dark variant classes', () => {
    renderDrawer({ variant: 'dark' })

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui:bg-neutral-900')
    expect(dialog.className).toContain('ui:text-neutral-200')
  })

  it('should apply light variant classes by default', () => {
    renderDrawer()

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui:bg-popover')
  })

  it('should animate on first open', () => {
    renderDrawer()

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('ui:animate-slide-up')
  })

  it('should render in a portal', () => {
    renderDrawer()

    const portalRoot = document.getElementById('portal')
    expect(portalRoot).toBeInTheDocument()
    expect(portalRoot?.querySelector('[role="dialog"]')).toBeInTheDocument()
  })

  it('should render children in Header', () => {
    renderDrawer()

    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should render children in Body', () => {
    renderDrawer()

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should forward className to dialog element', () => {
    renderDrawer({ className: 'custom-class' })

    expect(screen.getByRole('dialog').className).toContain('custom-class')
  })

  it('should use ghost-dark variant on close button when dark', () => {
    renderDrawer({ variant: 'dark' })

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    expect(closeBtn.className).toContain('ui:text-neutral-400')
  })

  it('should throw if Header is used outside Drawer', () => {
    expect(() => {
      render(<Drawer.Header>Orphan</Drawer.Header>)
    }).toThrow('Drawer subcomponents must be used within Drawer')
  })
})
