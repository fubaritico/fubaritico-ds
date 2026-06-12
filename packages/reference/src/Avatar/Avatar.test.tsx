import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Avatar from './Avatar'

import type { AvatarSize } from './Avatar'

describe('Avatar', () => {
  describe('happy path', () => {
    it('renders the image when a src is provided', () => {
      render(<Avatar src="https://example.com/a.jpg" alt="John Doe" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', 'https://example.com/a.jpg')
      expect(img).toHaveAttribute('alt', 'John Doe')
      expect(img).toHaveClass('ui-avatar__image')
    })

    it('renders the initials when no src is provided', () => {
      render(<Avatar alt="John Doe" initials="JD" />)
      const initials = screen.getByText('JD')
      expect(initials).toBeInTheDocument()
      expect(initials).toHaveClass('ui-avatar__initials')
    })

    it('renders the User icon when there is neither src nor initials', () => {
      const { container } = render(<Avatar alt="Unknown user" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('ui-avatar__icon')
    })

    it('exposes the alt as the accessible name on the fallback container', () => {
      // No <img> in the fallback tiers → the container itself carries role="img" + aria-label.
      render(<Avatar alt="Unknown user" />)
      expect(
        screen.getByRole('img', { name: 'Unknown user' })
      ).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each([
      ['xs', 'ui-avatar--xs'],
      ['sm', 'ui-avatar--sm'],
      ['lg', 'ui-avatar--lg'],
      ['xl', 'ui-avatar--xl'],
      ['2xl', 'ui-avatar--2xl'],
      ['3xl', 'ui-avatar--3xl'],
    ] as [AvatarSize, string][])(
      'applies the %s size modifier',
      (size, modifier) => {
        const { container } = render(<Avatar alt="Test" size={size} />)
        expect(container.firstChild).toHaveClass('ui-avatar', modifier)
      }
    )

    it('emits only the base class for the default md size', () => {
      const { container } = render(<Avatar alt="Test" />)
      expect(container.firstChild).toHaveClass('ui-avatar')
      expect(container.firstChild).not.toHaveClass('ui-avatar--md')
    })

    it('merges a custom className with the resolved classes', () => {
      const { container } = render(<Avatar alt="Test" className="custom" />)
      expect(container.firstChild).toHaveClass('ui-avatar', 'custom')
    })
  })

  describe('managed errors', () => {
    it('falls back to the icon when the image fails to load', () => {
      const { container } = render(
        <Avatar src="https://invalid.url/x.jpg" alt="Broken" />
      )
      // Before the error, the only role="img" is the real <img> (the container has no role yet).
      fireEvent.error(screen.getByRole('img')) // image error is a DOM media event, not a user action
      // No real <img> tag remains; the fallback container takes over the role="img".
      expect(container.querySelector('img')).not.toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('falls back to the initials on image error when initials are provided', () => {
      render(
        <Avatar src="https://invalid.url/x.jpg" alt="John" initials="JD" />
      )
      fireEvent.error(screen.getByRole('img'))
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('unmanaged errors', () => {
    it('treats a null src like a missing image (renders initials)', () => {
      const { container } = render(
        <Avatar src={null} alt="No image" initials="NI" />
      )
      expect(container.querySelector('img')).not.toBeInTheDocument()
      expect(screen.getByText('NI')).toBeInTheDocument()
    })

    it('treats an empty-string src like a missing image (renders the icon)', () => {
      const { container } = render(<Avatar src="" alt="Empty" />)
      expect(container.querySelector('img')).not.toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('truncates initials longer than 2 characters', () => {
      render(<Avatar alt="John Doe Smith" initials="JDS" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('forwards extra img attributes to the rendered image', () => {
      render(
        <Avatar
          src="https://example.com/a.jpg"
          alt="With testid"
          data-testid="avatar-img"
        />
      )
      expect(screen.getByTestId('avatar-img')).toBeInTheDocument()
    })

    it('renders unicode initials truncated to 2 characters', () => {
      render(<Avatar alt="Émile Ñoño" initials="ÉÑ" />)
      expect(screen.getByText('ÉÑ')).toBeInTheDocument()
    })
  })
})
