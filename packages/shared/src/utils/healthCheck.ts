import { retry } from './retry.js'

export interface HealthCheckOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
}

export const defaultHealthCheckOptions: Required<HealthCheckOptions> = {
  maxRetries: 5,
  retryDelay: 1000,
  timeout: 5000,
}

export async function checkRemoteHealth(
  remoteUrl: string,
  options: HealthCheckOptions = defaultHealthCheckOptions
): Promise<boolean> {
  const { maxRetries, retryDelay, timeout } = {
    ...defaultHealthCheckOptions,
    ...options,
  }

  try {
    await retry(
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, timeout)

        try {
          await fetch(remoteUrl, {
            signal: controller.signal,
            mode: 'no-cors',
          })

          return true
        } finally {
          clearTimeout(timeoutId)
        }
      },
      {
        maxRetries,
        retryDelay,
      }
    )

    return true
  } catch (error) {
    console.error(`Health check failed for ${remoteUrl}:`, error)
    return false
  }
}
