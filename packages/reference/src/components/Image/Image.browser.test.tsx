import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Image from './Image'

// Real Chromium: a real IntersectionObserver, real decoding, real load / error events and a real
// canvas for `autoBlur` — under jsdom all of these are mocks.

/** A valid 1×1 PNG. */
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

/** A data URL the decoder rejects. */
const BROKEN = 'data:image/png;base64,bm90IGFuIGltYWdl'

const frame = () => {
  const element = document.querySelector<HTMLElement>('.ui-image')
  if (!element) throw new Error('image frame not rendered')
  return element
}

describe('Image (browser)', () => {
  describe('happy path', () => {
    it('loads the source, settles to "loaded" and reveals the picture', async () => {
      const onLoad = vi.fn()
      render(<Image src={PIXEL} alt="Pixel" onLoad={onLoad} />)

      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'loaded')
      })
      expect(onLoad).toHaveBeenCalledOnce()
      expect(screen.getByRole('img', { name: 'Pixel' })).toHaveClass(
        'ui-image__img--loaded'
      )
      // The blur placeholder, if any, is never announced: the picture is the only image.
      expect(screen.getAllByRole('img')).toHaveLength(1)
    })
  })

  describe('variants', () => {
    it('lazy: requests nothing off-screen, then loads once scrolled into view', async () => {
      render(
        <div
          data-testid="scroller"
          style={{ blockSize: '200px', overflow: 'auto' }}
        >
          <div style={{ blockSize: '2000px' }} />
          <div style={{ inlineSize: '100px' }}>
            <Image src={PIXEL} alt="Far" loading="lazy" />
          </div>
        </div>
      )
      // Give the observer a frame to report the initial (non-)intersection.
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(screen.queryByRole('img', { name: 'Far' })).toBeNull()

      const scroller = screen.getByTestId('scroller')
      scroller.scrollTop = scroller.scrollHeight

      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'loaded')
      })
      expect(screen.getByRole('img', { name: 'Far' })).toBeInTheDocument()
    })

    it('locks the frame to its aspect ratio before anything loads', () => {
      render(
        <div style={{ inlineSize: '160px' }}>
          <Image src={BROKEN} alt="" aspectRatio="16/9" loading="lazy" />
        </div>
      )
      const { width, height } = frame().getBoundingClientRect()
      expect(width).toBeCloseTo(160, 0)
      expect(height).toBeCloseTo(90, 0)
    })
  })

  describe('managed errors', () => {
    it('swaps a failing source for the default fallback', async () => {
      const onError = vi.fn()
      render(<Image src={BROKEN} alt="Broken" onError={onError} />)

      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'error')
      })
      expect(onError).toHaveBeenCalledOnce()
      // The picture is gone; its name is not — the fallback carries it.
      expect(screen.getByRole('img', { name: 'Broken' })).toHaveClass(
        'ui-image__fallback'
      )
    })

    it('keeps a decorative image out of the tree when it fails', async () => {
      render(<Image src={BROKEN} alt="" />)

      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'error')
      })
      expect(screen.queryByRole('img')).toBeNull()
    })

    it('renders a custom fallback instead', async () => {
      render(
        <Image src={BROKEN} alt="Broken" fallback={<span>No picture</span>} />
      )

      expect(await screen.findByText('No picture')).toBeInTheDocument()
    })
  })

  describe('unmanaged errors', () => {
    it('still settles when autoBlur cannot decode the source', async () => {
      render(<Image src={BROKEN} alt="Broken" autoBlur />)

      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'error')
      })
    })
  })

  describe('edge cases', () => {
    it('starts over and loads again when the source changes', async () => {
      const onLoad = vi.fn()
      const { rerender } = render(
        <Image src={BROKEN} alt="Swap" onLoad={onLoad} />
      )
      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'error')
      })

      rerender(<Image src={PIXEL} alt="Swap" onLoad={onLoad} />)
      await vi.waitFor(() => {
        expect(frame()).toHaveAttribute('data-state', 'loaded')
      })
      expect(onLoad).toHaveBeenCalledOnce()
    })
  })
})
