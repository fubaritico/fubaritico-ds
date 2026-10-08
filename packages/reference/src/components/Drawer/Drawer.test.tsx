import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Drawer } from './Drawer'
import { DrawerBody } from './DrawerBody'
import { DrawerHeader } from './DrawerHeader'

// jsdom implements neither showModal() nor close(); mock them with an `open` attribute
// side-effect so Testing Library sees the dialog as visible.
// Stored in variables to avoid @typescript-eslint/unbound-method on prototype access.
const showModalMock = vi.fn(() => {
  screen.getByRole('dialog', { hidden: true }).setAttribute('open', '')
})
const closeMock = vi.fn(() => {
  screen.getByRole('dialog', { hidden: true }).removeAttribute('open')
})
HTMLDialogElement.prototype.showModal = showModalMock
HTMLDialogElement.prototype.close = closeMock

/** Renders an open drawer with both regions, so each test states only what it varies. */
const renderDrawer = (props: Partial<Parameters<typeof Drawer>[0]> = {}) =>
  render(
    <Drawer open onClose={vi.fn()} aria-label="Filters" {...props}>
      <Drawer.Header>Filters</Drawer.Header>
      <Drawer.Body>Content</Drawer.Body>
    </Drawer>
  )

describe('Drawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  describe('happy path', () => {
    it('renders a named dialog holding its regions', () => {
      renderDrawer()

      const dialog = screen.getByRole('dialog', { name: 'Filters' })
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('opens through showModal, which is what grants the focus trap', () => {
      renderDrawer()

      expect(showModalMock).toHaveBeenCalled()
    })

    it('anchors to the inline-start edge by default', () => {
      renderDrawer()

      expect(screen.getByRole('dialog')).toHaveClass('ui-drawer--start')
    })
  })

  describe('variants', () => {
    it.each([
      ['start', 'ui-drawer--start'],
      ['end', 'ui-drawer--end'],
      ['top', 'ui-drawer--top'],
    ] as const)('anchors to the %s edge', (side, modifier) => {
      renderDrawer({ side })

      expect(screen.getByRole('dialog')).toHaveClass(modifier)
    })

    it.each([
      ['sm', 'ui-drawer--sm'],
      ['lg', 'ui-drawer--lg'],
    ] as const)('applies the %s size', (size, modifier) => {
      renderDrawer({ size })

      expect(screen.getByRole('dialog')).toHaveClass(modifier)
    })

    it('emits no size modifier for the default md', () => {
      renderDrawer({ size: 'md' })

      expect(screen.getByRole('dialog').className).toBe(
        'ui-drawer ui-drawer--start'
      )
    })

    it('applies the dark surface', () => {
      renderDrawer({ variant: 'dark' })

      expect(screen.getByRole('dialog')).toHaveClass('ui-drawer--dark')
    })

    it('closes the native dialog when open turns false', () => {
      renderDrawer({ open: false })

      expect(closeMock).toHaveBeenCalled()
    })

    it('locks body scroll while open', () => {
      renderDrawer()

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('renders an optional footer region', () => {
      render(
        <Drawer open onClose={vi.fn()} aria-label="Filters">
          <Drawer.Body>Content</Drawer.Body>
          <Drawer.Footer>Actions</Drawer.Footer>
        </Drawer>
      )

      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('closes from the header button', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      renderDrawer({ onClose })

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('closes on the browser close event (Escape)', () => {
      const onClose = vi.fn()
      renderDrawer({ onClose })

      screen.getByRole('dialog').dispatchEvent(new Event('close'))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('closes on a backdrop click', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      renderDrawer({ onClose })

      await user.click(screen.getByRole('dialog'))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('ignores a click landing on the content', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <Drawer open onClose={onClose} aria-label="Filters">
          <Drawer.Body>
            <button type="button">Inside</button>
          </Drawer.Body>
        </Drawer>
      )

      await user.click(screen.getByRole('button', { name: 'Inside' }))

      expect(onClose).not.toHaveBeenCalled()
    })

    it('prefers onOverlayClick over onClose for a backdrop click', async () => {
      const onClose = vi.fn()
      const onOverlayClick = vi.fn()
      const user = userEvent.setup()
      renderDrawer({ onClose, onOverlayClick })

      await user.click(screen.getByRole('dialog'))

      expect(onOverlayClick).toHaveBeenCalledOnce()
      expect(onClose).not.toHaveBeenCalled()
    })

    it('throws when a region is used outside a Drawer', () => {
      // The thrown error is expected; silence React's console noise for this assertion.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

      expect(() => render(<DrawerHeader>Orphan</DrawerHeader>)).toThrow(
        'Drawer.* must be used within <Drawer>'
      )

      spy.mockRestore()
    })
  })

  describe('unmanaged errors', () => {
    it('restores body scroll when unmounted while still open', () => {
      const { unmount } = renderDrawer()
      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(document.body.style.overflow).toBe('')
    })

    it('restores the host page overflow instead of blanking it', () => {
      document.body.style.overflow = 'scroll'

      const { unmount } = renderDrawer()
      unmount()

      expect(document.body.style.overflow).toBe('scroll')
    })
  })

  describe('edge cases', () => {
    it('renders an empty drawer without crashing', () => {
      render(<Drawer open onClose={vi.fn()} aria-label="Empty" />)

      expect(screen.getByRole('dialog', { name: 'Empty' })).toBeInTheDocument()
    })

    it('renders a body with no header, so the close button is the consumer’s job', () => {
      render(
        <Drawer open onClose={vi.fn()} aria-label="Filters">
          <DrawerBody>Content</DrawerBody>
        </Drawer>
      )

      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    })

    it('lets the close button be renamed', () => {
      render(
        <Drawer open onClose={vi.fn()} aria-label="Filters">
          <Drawer.Header closeLabel="Close the filters">Filters</Drawer.Header>
        </Drawer>
      )

      expect(
        screen.getByRole('button', { name: 'Close the filters' })
      ).toBeInTheDocument()
    })

    it('survives a rapid open / close / open cycle', () => {
      const { rerender } = renderDrawer()
      rerender(
        <Drawer open={false} onClose={vi.fn()} aria-label="Filters">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      )
      rerender(
        <Drawer open onClose={vi.fn()} aria-label="Filters">
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      )

      expect(document.body.style.overflow).toBe('hidden')
      expect(showModalMock).toHaveBeenCalledTimes(2)
    })

    it('keeps working when the consumer also passes a ref to the dialog', () => {
      const consumerRef = { current: null as HTMLDialogElement | null }

      render(
        <Drawer open onClose={vi.fn()} aria-label="Filters" ref={consumerRef}>
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      )

      // The internal ref drives showModal(); a consumer ref must not displace it.
      expect(showModalMock).toHaveBeenCalled()
      expect(consumerRef.current).toBeInstanceOf(HTMLDialogElement)
    })

    it('merges a consumer className without dropping the block class', () => {
      renderDrawer({ className: 'custom' })
      const dialog = screen.getByRole('dialog')

      expect(dialog).toHaveClass('ui-drawer')
      expect(dialog).toHaveClass('custom')
    })

    it('forwards rest props to the dialog element', () => {
      render(
        <Drawer
          open
          onClose={vi.fn()}
          aria-label="Filters"
          data-testid="drawer"
          id="filters"
        >
          <Drawer.Body>Content</Drawer.Body>
        </Drawer>
      )

      expect(screen.getByTestId('drawer')).toHaveAttribute('id', 'filters')
    })
  })
})
