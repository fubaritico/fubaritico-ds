import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import NextImage from './NextImage'

import '@testing-library/jest-dom'

vi.mock('next/image', () => ({
  default: ({
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    blurDataURL?: string
    placeholder?: string
  }) => (
    <img
      {...props}
      data-blur={props.blurDataURL}
      data-placeholder={props.placeholder}
    />
  ),
}))

describe('NextImage (server)', () => {
  it('should render image with correct props', () => {
    render(<NextImage src="/test.jpg" alt="Test" width={100} height={100} />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toBeInTheDocument()
  })

  it('should not have data-state attribute', () => {
    render(<NextImage src="/test.jpg" alt="Test" width={100} height={100} />)
    const container = screen.getByRole('img', { name: 'Test' }).parentElement
    expect(container).not.toHaveAttribute('data-state')
  })

  it('should not apply opacity-0 class to image', () => {
    render(<NextImage src="/test.jpg" alt="Test" width={100} height={100} />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).not.toHaveClass('ui:opacity-0')
  })

  it('should use placeholder="blur" when blurDataURL is provided', () => {
    render(
      <NextImage
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        blurDataURL="data:image/jpeg;base64,abc"
      />
    )
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveAttribute('data-placeholder', 'blur')
    expect(img).toHaveAttribute('data-blur', 'data:image/jpeg;base64,abc')
  })

  it('should use placeholder="empty" when blurDataURL is absent', () => {
    render(<NextImage src="/test.jpg" alt="Test" width={100} height={100} />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveAttribute('data-placeholder', 'empty')
  })

  it('should apply aspectRatio as container style', () => {
    render(
      <NextImage
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        aspectRatio="2/3"
      />
    )
    const container = screen.getByRole('img', { name: 'Test' }).parentElement
    expect(container).toHaveStyle({ aspectRatio: '2/3' })
  })

  it('should apply imageClassName to the img element', () => {
    render(
      <NextImage
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        imageClassName="ui:object-cover"
      />
    )
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveClass('ui:object-cover')
  })
})
