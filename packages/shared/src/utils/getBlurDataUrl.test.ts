// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getBlurDataUrl } from './getBlurDataUrl.js'

interface MockCanvasContext {
  drawImage: ReturnType<typeof vi.fn>
}

interface MockCanvas {
  width: number
  height: number
  getContext: ReturnType<typeof vi.fn>
  toDataURL: ReturnType<typeof vi.fn>
}

interface MockImage {
  src: string
  crossOrigin: string
  onload: (() => void) | null
  onerror: (() => void) | null
}

describe('getBlurDataUrl', () => {
  let mockImage: MockImage
  let mockCanvas: MockCanvas
  let mockCanvasContext: MockCanvasContext

  const buildImageConstructor = (instance: MockImage): typeof Image => {
    return vi.fn(function () {
      const proxy = Object.create(instance) as MockImage
      Object.defineProperty(proxy, 'src', {
        set(value: string) {
          instance.src = value
          void Promise.resolve().then(() => {
            if (proxy.onload) proxy.onload()
          })
        },
        get() {
          return instance.src
        },
      })
      return proxy
    }) as unknown as typeof Image
  }

  const buildErrorImageConstructor = (instance: MockImage): typeof Image => {
    return vi.fn(function () {
      const proxy = Object.create(instance) as MockImage
      Object.defineProperty(proxy, 'src', {
        set(value: string) {
          instance.src = value
          void Promise.resolve().then(() => {
            if (proxy.onerror) proxy.onerror()
          })
        },
        get() {
          return instance.src
        },
      })
      return proxy
    }) as unknown as typeof Image
  }

  beforeEach(() => {
    mockCanvasContext = {
      drawImage: vi.fn(),
    }

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockCanvasContext),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,mockBase64'),
    }

    mockImage = {
      src: '',
      crossOrigin: '',
      onload: null,
      onerror: null,
    }

    window.Image = buildImageConstructor(mockImage)

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas')
        return mockCanvas as unknown as HTMLCanvasElement
      return {} as HTMLElement
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('resolves with base64 data URL when image loads successfully', async () => {
    const result = await getBlurDataUrl('https://example.com/image.jpg')

    expect(result).toBe('data:image/jpeg;base64,mockBase64')
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.3)
    expect(mockCanvasContext.drawImage).toHaveBeenCalled()
  })

  it('uses custom size parameter', async () => {
    await getBlurDataUrl('https://example.com/image.jpg', 32)

    expect(mockCanvas.width).toBe(32)
    expect(mockCanvas.height).toBe(32)
  })

  it('uses custom quality parameter', async () => {
    await getBlurDataUrl('https://example.com/image.jpg', 16, 0.8)

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
  })

  it('appends cache buster with ? when URL has no query params', async () => {
    await getBlurDataUrl('https://example.com/image.jpg')

    expect(mockImage.src).toMatch(
      /^https:\/\/example\.com\/image\.jpg\?_cors=\d+$/
    )
  })

  it('appends cache buster with & when URL already has query params', async () => {
    await getBlurDataUrl('https://example.com/image.jpg?size=large')

    expect(mockImage.src).toMatch(
      /^https:\/\/example\.com\/image\.jpg\?size=large&_cors=\d+$/
    )
  })

  it('rejects with "Canvas context not available" when getContext returns null', async () => {
    mockCanvas.getContext.mockReturnValueOnce(null)

    await expect(
      getBlurDataUrl('https://example.com/image.jpg')
    ).rejects.toThrow('Canvas context not available')
  })

  it('rejects with "Failed to load image" when image onerror fires', async () => {
    const src = 'https://example.com/missing.jpg'

    window.Image = buildErrorImageConstructor(mockImage)

    await expect(getBlurDataUrl(src)).rejects.toThrow(
      `Failed to load image: ${src}`
    )
  })

  it('rejects with original error if canvas throws', async () => {
    mockCanvas.toDataURL.mockImplementationOnce(() => {
      throw new Error('Canvas error')
    })

    await expect(
      getBlurDataUrl('https://example.com/image.jpg')
    ).rejects.toThrow('Canvas error')
  })
})
