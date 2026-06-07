import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getImageUrl, getOptimizedImageUrl } from './tmdbImage.js'

describe('getImageUrl', () => {
  it('returns empty string for null path', () => {
    expect(getImageUrl(null)).toBe('')
  })

  it('returns empty string for undefined path', () => {
    expect(getImageUrl(undefined)).toBe('')
  })

  it('constructs correct TMDB URL with default w500 size', () => {
    const result = getImageUrl('/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg')
    expect(result).toBe(
      'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg'
    )
  })

  it('constructs correct URL with custom size', () => {
    const result = getImageUrl('/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', 'w780')
    expect(result).toBe(
      'https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg'
    )
  })
})

describe('getOptimizedImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USE_NETLIFY_CDN', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns empty string for null path', () => {
    expect(getOptimizedImageUrl(null)).toBe('')
  })

  it('returns empty string for undefined path', () => {
    expect(getOptimizedImageUrl(undefined)).toBe('')
  })

  it('returns direct TMDB URL with quality params when CDN disabled', () => {
    const result = getOptimizedImageUrl(
      '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      'w300',
      80
    )
    expect(result).toBe(
      'https://image.tmdb.org/t/p/w300/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg?q=80&fm=auto'
    )
  })

  it('returns Netlify CDN URL when VITE_USE_NETLIFY_CDN is true', () => {
    vi.stubEnv('VITE_USE_NETLIFY_CDN', 'true')
    const result = getOptimizedImageUrl(
      '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      'w500',
      80
    )
    const baseUrl =
      'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg'
    const encodedUrl = encodeURIComponent(baseUrl)
    expect(result).toBe(`/.netlify/images?url=${encodedUrl}&q=80&w=500&q=avif`)
  })

  it('encodes path correctly in Netlify CDN URL', () => {
    vi.stubEnv('VITE_USE_NETLIFY_CDN', 'true')
    const path = '/path/with spaces.jpg'
    const result = getOptimizedImageUrl(path, 'w300', 60)
    expect(result).toContain('/.netlify/images?url=')
    expect(result).toContain('&q=60&w=300&q=avif')
    // Verify encoding happened by checking %2F for slash encoding
    expect(result).toContain('%2F')
  })

  it('uses default size w300 when not provided', () => {
    const result = getOptimizedImageUrl('/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg')
    expect(result).toBe(
      'https://image.tmdb.org/t/p/w300/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg?q=80&fm=auto'
    )
  })

  it('uses default quality 80 when not provided', () => {
    const result = getOptimizedImageUrl(
      '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      'w500'
    )
    expect(result).toBe(
      'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg?q=80&fm=auto'
    )
  })
})
