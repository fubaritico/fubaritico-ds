/**
 * Generates a blurred base64 data URL from an image source using Canvas API
 * Works with any image URL (not limited to specific providers)
 *
 * @param src - Image source URL
 * @param size - Size of the blur canvas (smaller = more blur). Default: 16
 * @param quality - JPEG quality (0-1). Default: 0.3
 * @returns Promise with base64 data URL
 */
export const getBlurDataUrl = (
  src: string,
  size = 16,
  quality = 0.3
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image()

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        canvas.width = size
        canvas.height = size

        ctx.drawImage(img, 0, 0, size, size)

        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve(base64)
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error'))
      }
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`))
    }

    img.crossOrigin = 'anonymous'

    const cacheBuster = `_cors=${String(Date.now())}`
    const urlWithCacheBuster = src.includes('?')
      ? `${src}&${cacheBuster}`
      : `${src}?${cacheBuster}`

    img.src = urlWithCacheBuster
  })
}
