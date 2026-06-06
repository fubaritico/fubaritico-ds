import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import NextImageClient from './NextImageClient'

import '@testing-library/jest-dom'

vi.mock('next/image', () => ({
  default: ({
    onLoad,
    onError,
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
      onLoad={onLoad}
      onError={onError}
    />
  ),
}))

vi.mock('../../Icon', () => ({
  Icon: ({ name, ...props }: { name: string }) => (
    <span data-testid="icon" data-name={name} {...props} />
  ),
}))

describe('NextImageClient', () => {
  it('should render image with correct props', () => {
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toBeInTheDocument()
  })

  it('should set data-state to loading initially', () => {
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    expect(
      screen.getByRole('img', { name: 'Test' }).closest('[data-state]')
    ).toHaveAttribute('data-state', 'loading')
  })

  it('should set data-state to loaded after onLoad', () => {
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    fireEvent.load(screen.getByRole('img', { name: 'Test' }))
    expect(
      screen.getByRole('img', { name: 'Test' }).closest('[data-state]')
    ).toHaveAttribute('data-state', 'loaded')
  })

  it('should set data-state to error and show default fallback on error', () => {
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    fireEvent.error(screen.getByRole('img', { name: 'Test' }))
    expect(screen.getByTestId('icon')).toHaveAttribute('data-name', 'Photo')
    expect(screen.getByTestId('icon').closest('[data-state]')).toHaveAttribute(
      'data-state',
      'error'
    )
  })

  it('should show custom fallback on error', () => {
    render(
      <NextImageClient
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        fallback={<div data-testid="custom-fallback">Custom</div>}
      />
    )
    fireEvent.error(screen.getByRole('img', { name: 'Test' }))
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
  })

  it('should use placeholder="blur" when blurDataURL is provided', () => {
    render(
      <NextImageClient
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
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveAttribute('data-placeholder', 'empty')
  })

  it('should apply aspectRatio as container style', () => {
    render(
      <NextImageClient
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        aspectRatio="2/3"
      />
    )
    const container = screen
      .getByRole('img', { name: 'Test' })
      .closest('[data-state]')
    expect(container).toHaveStyle({ aspectRatio: '2/3' })
  })

  it('should call external onLoad callback', () => {
    const onLoad = vi.fn()
    render(
      <NextImageClient
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        onLoad={onLoad}
      />
    )
    fireEvent.load(screen.getByRole('img', { name: 'Test' }))
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('should call external onError callback', () => {
    const onError = vi.fn()
    render(
      <NextImageClient
        src="/test.jpg"
        alt="Test"
        width={100}
        height={100}
        onError={onError}
      />
    )
    fireEvent.error(screen.getByRole('img', { name: 'Test' }))
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('should apply image opacity classes based on state', () => {
    render(
      <NextImageClient src="/test.jpg" alt="Test" width={100} height={100} />
    )
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toHaveClass('ui:opacity-0')

    fireEvent.load(img)
    expect(img).toHaveClass('ui:opacity-100')
  })
})
