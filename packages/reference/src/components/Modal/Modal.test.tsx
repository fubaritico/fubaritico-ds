import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

// jsdom does not implement <dialog> methods — mock them with an `open` attribute side-effect so
// Testing Library treats the dialog as accessible (visible).
// Stored in variables to avoid @typescript-eslint/unbound-method on prototype access.
const showModalMock = vi.fn(() => {
  screen.getByRole('dialog', { hidden: true }).setAttribute('open', '')
})
const closeMock = vi.fn(() => {
  screen.getByRole('dialog', { hidden: true }).removeAttribute('open')
})
HTMLDialogElement.prototype.showModal = showModalMock
HTMLDialogElement.prototype.close = closeMock

describe('Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = ''
  })

  describe('happy path', () => {
    it('renders its children', () => {
      render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('opens through showModal, so the dialog lands in the top layer', () => {
      render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(showModalMock).toHaveBeenCalled()
    })

    it('wears the skin block class', () => {
      const { container } = render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(container.querySelector('dialog')).toHaveClass('ui-modal')
    })
  })

  describe('variants', () => {
    it('closes the native dialog when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(closeMock).toHaveBeenCalled()
    })

    it('locks body scroll while open', () => {
      render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('releases body scroll when closed', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('')
    })

    it('exposes the dialog role with its required name', () => {
      render(
        <Modal isOpen onClose={vi.fn()} aria-label="Confirm deletion">
          <p>Content</p>
        </Modal>
      )

      const dialog = screen.getByRole('dialog', { name: 'Confirm deletion' })
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('prefers onOverlayClick over onClose for a backdrop click', async () => {
      const onClose = vi.fn()
      const onOverlayClick = vi.fn()
      const user = userEvent.setup()
      render(
        <Modal
          isOpen
          onClose={onClose}
          onOverlayClick={onOverlayClick}
          aria-label="Dialog"
        >
          <p>Content</p>
        </Modal>
      )

      await user.click(screen.getByRole('dialog'))

      expect(onOverlayClick).toHaveBeenCalledOnce()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('managed errors', () => {
    it('closes on the browser close event (Escape)', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen onClose={onClose} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      screen.getByRole('dialog').dispatchEvent(new Event('close'))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('closes on a backdrop click', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <Modal isOpen onClose={onClose} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      await user.click(screen.getByRole('dialog'))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('ignores a click landing on the content', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      render(
        <Modal isOpen onClose={onClose} aria-label="Dialog">
          <button type="button">Inside</button>
        </Modal>
      )

      await user.click(screen.getByRole('button', { name: 'Inside' }))

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('unmanaged errors', () => {
    it('restores body scroll when unmounted while still open', () => {
      const { unmount } = render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )
      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(document.body.style.overflow).toBe('')
    })

    it('restores the host page overflow instead of blanking it', () => {
      document.body.style.overflow = 'scroll'

      const { unmount } = render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )
      unmount()

      expect(document.body.style.overflow).toBe('scroll')
    })
  })

  describe('edge cases', () => {
    it('renders an empty dialog without crashing', () => {
      render(<Modal isOpen onClose={vi.fn()} aria-label="Empty" />)

      expect(screen.getByRole('dialog', { name: 'Empty' })).toBeInTheDocument()
    })

    it('survives a rapid open / close / open cycle', () => {
      const { rerender } = render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )
      rerender(
        <Modal isOpen={false} onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )
      rerender(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog">
          <p>Content</p>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('hidden')
      expect(showModalMock).toHaveBeenCalledTimes(2)
    })

    it('merges a consumer className without dropping the block class', () => {
      const { container } = render(
        <Modal isOpen onClose={vi.fn()} aria-label="Dialog" className="custom">
          <p>Content</p>
        </Modal>
      )
      const dialog = container.querySelector('dialog')

      expect(dialog).toHaveClass('ui-modal')
      expect(dialog).toHaveClass('custom')
    })

    it('forwards rest props to the dialog element', () => {
      render(
        <Modal
          isOpen
          onClose={vi.fn()}
          aria-label="Dialog"
          data-testid="modal"
          id="confirm"
        >
          <p>Content</p>
        </Modal>
      )

      expect(screen.getByTestId('modal')).toHaveAttribute('id', 'confirm')
    })
  })
})
