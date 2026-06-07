import { QueryClient } from '@tanstack/react-query'

/**
 * Creates a QueryClient configured for testing
 * - Disables retries to avoid hanging tests
 * - Can be customized with additional options
 */
export function createTestQueryClient(
  options?: Partial<ConstructorParameters<typeof QueryClient>[0]>
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        ...options?.defaultOptions?.queries,
      },
      mutations: {
        retry: false,
        ...options?.defaultOptions?.mutations,
      },
    },
    ...options,
  })
}
