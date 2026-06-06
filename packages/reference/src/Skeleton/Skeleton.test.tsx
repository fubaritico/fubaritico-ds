import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Skeleton from './Skeleton'

describe('Skeleton', () => {
  it('renders default (rectangle variant)', () => {
    const { container } = render(<Skeleton />)
    expect(container).toMatchSnapshot()
  })

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)
    expect(container).toMatchSnapshot()
  })

  it('renders line variant', () => {
    const { container } = render(<Skeleton variant="line" />)
    expect(container).toMatchSnapshot()
  })

  it('renders with width and height', () => {
    const { container } = render(<Skeleton width="200px" height="100px" />)
    expect(container).toMatchSnapshot()
  })

  it('renders with aspectRatio', () => {
    const { container } = render(<Skeleton aspectRatio="16 / 9" />)
    expect(container).toMatchSnapshot()
  })

  it('renders rectangle with rounded=false', () => {
    const { container } = render(
      <Skeleton variant="rectangle" rounded={false} />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders line with rounded=false', () => {
    const { container } = render(<Skeleton variant="line" rounded={false} />)
    expect(container).toMatchSnapshot()
  })

  it('renders with custom className', () => {
    const { container } = render(<Skeleton className="ui:custom" />)
    expect(container).toMatchSnapshot()
  })
})
