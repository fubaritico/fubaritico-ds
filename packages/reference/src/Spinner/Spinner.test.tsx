import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Spinner from './Spinner'

describe('Spinner', () => {
  it('renders with default props', () => {
    const { container } = render(<Spinner />)
    expect(container).toMatchSnapshot()
  })

  it('renders with custom className', () => {
    const { container } = render(<Spinner className="ui:custom-class" />)
    expect(container).toMatchSnapshot()
  })
})
