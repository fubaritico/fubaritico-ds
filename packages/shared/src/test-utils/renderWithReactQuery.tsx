import { render } from '@testing-library/react'

import { ReactQueryWrapper } from './ReactQueryWrapper.js'

import type { RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Renders a component with React Query provider
 */
export const renderWithReactQuery = (
  ui: ReactNode,
  options?: RenderOptions
): ReturnType<typeof render> => {
  return render(ui, { wrapper: ReactQueryWrapper, ...options })
}
