import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { createTestQueryClient } from './query-client.js'

import type { ReactNode } from 'react'

/**
 * React Query wrapper component for tests
 * Creates a QueryClient with retry disabled
 */
export function ReactQueryWrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createTestQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
