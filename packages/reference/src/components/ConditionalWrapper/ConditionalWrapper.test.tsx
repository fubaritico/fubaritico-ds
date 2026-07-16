import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ConditionalWrapper } from './ConditionalWrapper'

afterEach(cleanup)

describe('ConditionalWrapper', () => {
  describe('happy path', () => {
    it('wraps children when the condition is true', () => {
      render(
        <ConditionalWrapper
          condition
          wrapper={(children) => <div data-testid="wrap">{children}</div>}
        >
          <span>content</span>
        </ConditionalWrapper>
      )
      expect(screen.getByTestId('wrap')).toContainElement(
        screen.getByText('content')
      )
    })
  })

  describe('variants', () => {
    it('renders bare children when the condition is false and no defaultWrapper', () => {
      render(
        <ConditionalWrapper
          condition={false}
          wrapper={(children) => <div data-testid="wrap">{children}</div>}
        >
          <span>content</span>
        </ConditionalWrapper>
      )
      expect(screen.getByText('content')).toBeInTheDocument()
      expect(screen.queryByTestId('wrap')).toBeNull()
    })

    it('uses the defaultWrapper when the condition is false', () => {
      render(
        <ConditionalWrapper
          condition={false}
          defaultWrapper={(children) => (
            <div data-testid="default">{children}</div>
          )}
          wrapper={(children) => <div data-testid="wrap">{children}</div>}
        >
          <span>content</span>
        </ConditionalWrapper>
      )
      expect(screen.getByTestId('default')).toBeInTheDocument()
      expect(screen.queryByTestId('wrap')).toBeNull()
    })
  })

  // L3: managed errors — N/A (pure presentational helper)
  // L4: unmanaged errors — N/A (no async / external data)

  describe('edge cases', () => {
    it('prefers the active wrapper over the defaultWrapper when condition is true', () => {
      render(
        <ConditionalWrapper
          condition
          defaultWrapper={(children) => (
            <div data-testid="default">{children}</div>
          )}
          wrapper={(children) => <div data-testid="wrap">{children}</div>}
        >
          <span>content</span>
        </ConditionalWrapper>
      )
      expect(screen.getByTestId('wrap')).toBeInTheDocument()
      expect(screen.queryByTestId('default')).toBeNull()
    })
  })
})
