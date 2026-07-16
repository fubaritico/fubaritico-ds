import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import TrailerCard from './TrailerCard'

// jsdom does not implement <dialog> methods — mock them with open attribute side-effect
const showModalMock = vi.fn(() => {
  const dialogs = document.querySelectorAll('dialog')
  if (dialogs.length > 0) {
    dialogs[dialogs.length - 1].setAttribute('open', '')
  }
})
const closeMock = vi.fn(() => {
  const dialogs = document.querySelectorAll('dialog')
  if (dialogs.length > 0) {
    dialogs[dialogs.length - 1].removeAttribute('open')
  }
})

HTMLDialogElement.prototype.showModal = showModalMock
HTMLDialogElement.prototype.close = closeMock

describe('TrailerCard', () => {
  const defaultProps = {
    videoKey: 'dQw4w9WgXcQ',
    title: 'Test Trailer',
  }

  it('renders thumbnail with correct YouTube hqdefault URL', () => {
    render(<TrailerCard {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Trailer' })
    expect(img).toHaveAttribute(
      'src',
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    )
  })

  it('renders title as alt text on thumbnail', () => {
    render(<TrailerCard {...defaultProps} />)
    const img = screen.getByRole('img', { name: 'Test Trailer' })
    expect(img).toHaveAttribute('alt', 'Test Trailer')
  })

  it('renders type badge with default "Trailer" text', () => {
    render(<TrailerCard {...defaultProps} />)
    expect(screen.getByText('Trailer')).toBeInTheDocument()
  })

  it('renders type badge with custom type', () => {
    render(<TrailerCard {...defaultProps} type="Clip" />)
    expect(screen.getByText('Clip')).toBeInTheDocument()
  })

  it('thumbnail has role="button" and correct aria-label', () => {
    render(<TrailerCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    expect(button).toHaveAttribute('aria-label', 'Play Test Trailer')
  })

  it('thumbnail has tabIndex={0} for keyboard access', () => {
    render(<TrailerCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    expect(button).toHaveAttribute('tabIndex', '0')
  })

  it('opens modal on thumbnail click', async () => {
    const user = userEvent.setup()
    render(<TrailerCard {...defaultProps} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(showModalMock).toHaveBeenCalled()
  })

  it('opens modal on Enter key press', async () => {
    const user = userEvent.setup()
    render(<TrailerCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Play Test Trailer' })

    button.focus()
    await user.keyboard('{Enter}')

    expect(showModalMock).toHaveBeenCalled()
  })

  it('opens modal on Space key press', async () => {
    const user = userEvent.setup()
    render(<TrailerCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Play Test Trailer' })

    button.focus()
    await user.keyboard('{Space}')

    expect(showModalMock).toHaveBeenCalled()
  })

  it('does not open modal on other keys', () => {
    render(<TrailerCard {...defaultProps} />)
    const button = screen.getByRole('button', { name: 'Play Test Trailer' })

    const callCountBefore = showModalMock.mock.calls.length
    fireEvent.keyDown(button, { key: 'Escape' })
    const callCountAfter = showModalMock.mock.calls.length

    expect(callCountAfter).toBe(callCountBefore)
  })

  it('renders iframe with correct YouTube embed URL when modal is open', async () => {
    const user = userEvent.setup()
    const { container } = render(<TrailerCard {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    await user.click(button)

    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    )
  })

  it('iframe has correct title attribute', async () => {
    const user = userEvent.setup()
    const { container } = render(<TrailerCard {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    await user.click(button)

    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute('title', 'Test Trailer')
  })

  it('iframe has correct allow attributes', async () => {
    const user = userEvent.setup()
    const { container } = render(<TrailerCard {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    await user.click(button)

    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute(
      'allow',
      'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    )
  })

  it('iframe has allowFullScreen attribute', async () => {
    const user = userEvent.setup()
    const { container } = render(<TrailerCard {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Play Test Trailer' })
    await user.click(button)

    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute('allowFullScreen')
  })

  it('close button has aria-label="Close video"', async () => {
    const user = userEvent.setup()
    render(<TrailerCard {...defaultProps} />)

    const thumbnailButton = screen.getByRole('button', {
      name: 'Play Test Trailer',
    })
    await user.click(thumbnailButton)

    const closeButton = screen.getByRole('button', { name: 'Close video' })
    expect(closeButton).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<TrailerCard {...defaultProps} />)

    const playButton = screen.getByRole('button', {
      name: 'Play Test Trailer',
    })
    await user.click(playButton)

    const closeButton = screen.getByRole('button', { name: 'Close video' })
    await user.click(closeButton)

    expect(closeMock).toHaveBeenCalled()
  })

  it('forwards className to thumbnail wrapper', () => {
    render(<TrailerCard {...defaultProps} className="custom-class" />)

    const wrapper = screen.getByRole('button', { name: 'Play Test Trailer' })
    expect(wrapper).toHaveClass('custom-class')
  })
})
