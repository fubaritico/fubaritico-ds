const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

/**
 * Constructs the full image URL for TMDB images.
 */
export const getImageUrl = (
  path: string | null | undefined,
  size = 'w500'
): string => {
  if (!path) return ''
  return `${IMAGE_BASE_URL}/${size}${path}`
}

/**
 * Constructs an optimized image URL via Netlify Image CDN (when enabled).
 * Automatically converts to AVIF/WebP and handles caching on edge.
 *
 * When VITE_USE_NETLIFY_CDN=true (Netlify): routes through Netlify's Image CDN endpoint (/.netlify/images)
 * with automatic format negotiation (AVIF > WebP based on browser support).
 * Otherwise: serves images directly from TMDB with optimization query params.
 *
 * @param path - TMDB image path
 * @param size - TMDB image size (w300, w500, w780, w1280, etc.)
 * @param quality - Image quality 1-100 (default: 80)
 * @returns Optimized image URL
 *
 * @example
 * // With VITE_USE_NETLIFY_CDN=true: W300 JPEG → resized & transformed via Netlify CDN
 * getOptimizedImageUrl('/path/image.jpg', 'w300', 80)
 * // Result: /.netlify/images?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw300%2Fpath%2Fimage.jpg&w=300&q=80
 *
 * // Otherwise: serve directly from TMDB
 * // Result: https://image.tmdb.org/t/p/w300/path/image.jpg?q=80&fm=auto
 */
export const getOptimizedImageUrl = (
  path: string | null | undefined,
  size = 'w300',
  quality = 80
): string => {
  if (!path) return ''
  const baseUrl = getImageUrl(path, size)

  // Only use Netlify CDN if explicitly enabled via env var
  const useNetlifyCDN =
    (import.meta.env as Record<string, string>).VITE_USE_NETLIFY_CDN === 'true'

  if (useNetlifyCDN) {
    return `/.netlify/images?url=${encodeURIComponent(baseUrl)}&q=${String(quality)}&w=${size.replace('w', '')}&q=avif`
  }

  // Direct TMDB with query params (images will load, format conversion delegated to browser)
  // fm=auto: browser's Accept headers determine format
  return `${baseUrl}?q=${String(quality)}&fm=auto`
}
