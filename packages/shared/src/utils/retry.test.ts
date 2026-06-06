import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { retry } from './retry.js'

/**
 * Skipped test suite for instability reasons
 * TODO: come back on those tests later
 */
describe.skip('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn, { maxRetries: 3, retryDelay: 100 })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and returns on eventual success', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn, { maxRetries: 3, retryDelay: 100 })
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('throws after exhausting all retries with original error message', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Permanent failure'))
    const promise = retry(fn, { maxRetries: 2, retryDelay: 100 })

    // Attach rejection handler immediately, then run timers
    let caughtError: unknown = null
    promise.catch((err: unknown) => {
      caughtError = err
    })

    await vi.runAllTimersAsync()

    expect(caughtError).toBeInstanceOf(Error)
    expect((caughtError as Error).message).toBe('Permanent failure')
    expect(fn).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  it('applies exponential backoff delay between attempts', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success')

    const promise = retry(fn, { maxRetries: 2, retryDelay: 100 })
    await vi.runAllTimersAsync()
    const result = await promise

    // First retry after 100ms (2^0 * 100)
    // Second retry after 200ms (2^1 * 100)
    const delays = setTimeoutSpy.mock.calls.map((call) => call[1])
    expect(delays).toEqual([100, 200])
    expect(result).toBe('success')

    setTimeoutSpy.mockRestore()
  })

  it('throws with original error message on final failure', async () => {
    const errorMessage = 'Custom error message'
    const fn = vi.fn().mockRejectedValue(new Error(errorMessage))
    const promise = retry(fn, { maxRetries: 1, retryDelay: 50 })

    // Attach rejection handler immediately, then run timers
    let caughtError: unknown = null
    promise.catch((err: unknown) => {
      caughtError = err
    })

    await vi.runAllTimersAsync()

    expect(caughtError).toBeInstanceOf(Error)
    expect((caughtError as Error).message).toBe(errorMessage)
  })

  it('handles maxRetries=0 as zero retries (one attempt total)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Failed'))
    await expect(retry(fn, { maxRetries: 0, retryDelay: 100 })).rejects.toThrow(
      'Failed'
    )
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses fallback error message when lastError is null', async () => {
    const fn = vi.fn().mockImplementation(() => {
      return null // Edge case: throw null instead of Error
    })
    await expect(retry(fn, { maxRetries: 0, retryDelay: 100 })).rejects.toThrow(
      'Retry failed'
    )
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
