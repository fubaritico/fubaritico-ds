import { describe, expect, it } from 'vitest'

import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  describe('happy path', () => {
    it('formats hours, minutes and seconds together', () => {
      expect(formatDuration('01:30:45')).toBe('1 hour 30 mins 45 secs')
    })
  })

  describe('variants', () => {
    it('renders only the non-zero segments (minutes + seconds)', () => {
      expect(formatDuration('00:05:10')).toBe('5 mins 10 secs')
    })

    it('renders only hours when minutes and seconds are zero', () => {
      expect(formatDuration('02:00:00')).toBe('2 hours')
    })

    it('renders only seconds', () => {
      expect(formatDuration('00:00:09')).toBe('9 secs')
    })

    it('uses the singular form for a value of 1', () => {
      expect(formatDuration('01:01:01')).toBe('1 hour 1 min 1 sec')
    })
  })

  // L3 managed errors: N/A — a pure formatter with no user-facing error path.

  describe('unmanaged errors', () => {
    it('coerces non-numeric segments to 0', () => {
      expect(formatDuration('ab:cd:ef')).toBe('')
    })

    it('treats missing trailing segments as 0', () => {
      expect(formatDuration('03')).toBe('3 hours')
    })
  })

  describe('edge cases', () => {
    it('returns an empty string when every segment is 0', () => {
      expect(formatDuration('00:00:00')).toBe('')
    })

    it('returns an empty string for an empty input', () => {
      expect(formatDuration('')).toBe('')
    })

    it('handles large multi-digit values', () => {
      expect(formatDuration('100:200:300')).toBe('100 hours 200 mins 300 secs')
    })
  })
})
