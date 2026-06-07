import { ReactQueryWrapper } from './ReactQueryWrapper.js'
import { renderWithRouter } from './renderWithRouter.js'

import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

/**
 * Renders with router and React Query providers
 * @param element - the element to render
 * @param routes - the route to match as declared in the router configuration
 * @param path - the path to navigate to, supposed to match the route
 * @param options - additional options to pass to the render method
 */
export const renderReactQueryWithRouter = (
  element: ReactElement,
  routes: string | string[] = '/',
  path: string | string[] = '/',
  options?: RenderOptions
): ReturnType<typeof renderWithRouter> => {
  return renderWithRouter(element, routes, path, {
    wrapper: ReactQueryWrapper,
    ...options,
  })
}
