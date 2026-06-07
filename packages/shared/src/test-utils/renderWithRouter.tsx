import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'

import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

/**
 * Renders with a router provider (React Router v7)
 * @param element - the element to render at the route
 * @param routes - the route to match as declared in the router configuration
 * @param path - the path to navigate to, supposed to match the route
 * @param options - additional options to pass to the render method
 */
export const renderWithRouter = (
  element: ReactElement,
  routes: string | string[] = '/',
  path: string | string[] = '/',
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => {
  const router = createMemoryRouter(
    Array.isArray(routes)
      ? routes.map((route) => ({
          path: route,
          element,
        }))
      : [
          {
            path: routes,
            element,
          },
        ],
    {
      initialEntries: Array.isArray(path) ? path : [path],
    }
  )
  return render(<RouterProvider router={router} />, {
    ...options,
  })
}
