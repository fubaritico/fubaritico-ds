import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Modal from './Modal'

// jsdom does not implement <dialog> methods — mock them with open attribute side-effect
// so Testing Library treats the dialog as accessible (visible).
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

  it('renders children', () => {
    render(
      <Modal isOpen onClose={vi.fn()} aria-label="Test modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls showModal when isOpen is true', () => {
    render(
      <Modal isOpen onClose={vi.fn()} aria-label="Test modal">
        content
      </Modal>
    )
    expect(showModalMock).toHaveBeenCalledOnce()
  })

  it('calls close when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} aria-label="Test modal">
        content
      </Modal>
    )
    expect(closeMock).toHaveBeenCalledOnce()
  })

  it('locks body scroll when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} aria-label="Test modal">
        content
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} aria-label="Test modal">
        content
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} aria-label="Test modal">
        content
      </Modal>
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('calls onClose when native close event fires (ESC key)', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} aria-label="Test modal">
        content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    dialog.dispatchEvent(new Event('close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking the backdrop (dialog element itself)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} aria-label="Test modal">
        content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    await user.click(dialog)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when clicking modal content', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} aria-label="Test modal">
        <button>Inside button</button>
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: 'Inside button' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('has correct aria attributes', () => {
    render(
      <Modal isOpen onClose={vi.fn()} aria-label="PhotosModal viewer">
        content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'PhotosModal viewer')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
