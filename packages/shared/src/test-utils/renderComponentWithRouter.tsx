import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import { ReactQueryWrapper } from './ReactQueryWrapper.js'

import type { ReactElement, ReactNode } from 'react'

/**
 * Renders a component with router and react-query providers
 * @param component - the component to render
 * @param route - the route path (default '/')
 * @param queryClient - optional QueryClient instance for custom configuration
 */
export const renderComponentWithRouter = (
  component: ReactElement,
  route = '/',
  queryClient?: QueryClient
): ReturnType<typeof render> => {
  const router = createMemoryRouter(
    [
      {
        path: route,
        element: component,
      },
    ],
    {
      initialEntries: [route],
    }
  )

  const Wrapper = queryClient
    ? ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    : ReactQueryWrapper

  return render(
    <Wrapper>
      <RouterProvider router={router} />
    </Wrapper>
  )
}
