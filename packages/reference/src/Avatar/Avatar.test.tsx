import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Avatar from './Avatar'

import type { AvatarSize } from './Avatar'

/** Image events (load/error) are DOM media events, not user actions → fireEvent, not userEvent. */

describe('Avatar', () => {
  describe('happy path', () => {
    it('exposes the accessible name on the root regardless of tier', () => {
      render(
        <Avatar aria-label="Jane Doe">
          <Avatar.Fallback>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument()
    })

    it('shows the image once it loads', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      fireEvent.load(img!)
      expect(img).not.toHaveAttribute('hidden')
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('shows the initials when there is no image', () => {
      render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Initials>JD</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('shows the icon when there is neither image nor initials', () => {
      const { container } = render(
        <Avatar aria-label="Unknown">
          <Avatar.Fallback>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      expect(container.querySelector('svg')).toHaveClass('ui-avatar__icon')
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
      'applies the %s size modifier on the root',
      (size, modifier) => {
        const { container } = render(
          <Avatar aria-label="x" size={size}>
            <Avatar.Fallback>
              <Avatar.Icon />
            </Avatar.Fallback>
          </Avatar>
        )
        expect(container.firstChild).toHaveClass('ui-avatar', modifier)
      }
    )

    it('emits only the base class for the default md size', () => {
      const { container } = render(
        <Avatar aria-label="x">
          <Avatar.Fallback>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      expect(container.firstChild).toHaveClass('ui-avatar')
      expect(container.firstChild).not.toHaveClass('ui-avatar--md')
    })

    it('merges a custom className on the root', () => {
      const { container } = render(
        <Avatar aria-label="x" className="custom">
          <Avatar.Fallback>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      expect(container.firstChild).toHaveClass('ui-avatar', 'custom')
    })
  })

  describe('cascade resolution', () => {
    it('a loaded image wins over initials and icon', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Initials>JD</Avatar.Initials>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      fireEvent.load(container.querySelector('img')!)
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('falls over to the initials when the image errors', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Initials>JD</Avatar.Initials>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      fireEvent.error(container.querySelector('img')!)
      expect(screen.getByText('JD')).toBeInTheDocument()
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('falls over to the icon when the image errors and there are no initials', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      fireEvent.error(container.querySelector('img')!)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('resolves the first loaded source across multiple images', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Image src="https://x/b.jpg" />
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      )
      const imgs = container.querySelectorAll('img')
      fireEvent.error(imgs[0]) // first source fails
      fireEvent.load(imgs[1]) // second source loads
      expect(imgs[0]).toHaveAttribute('hidden')
      expect(imgs[1]).not.toHaveAttribute('hidden')
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('blocks later candidates while the image is still loading (anti-flash)', () => {
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg" />
            <Avatar.Initials>JD</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
      )
      // Still loading: neither the (hidden) image nor the initials are shown.
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
      expect(container.querySelector('img')).toHaveAttribute('hidden')
    })
  })

  describe('managed errors', () => {
    it('fires onLoadingStatusChange on each transition', () => {
      const onChange = vi.fn()
      const { container } = render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image
              src="https://x/a.jpg"
              onLoadingStatusChange={onChange}
            />
          </Avatar.Fallback>
        </Avatar>
      )
      expect(onChange).toHaveBeenCalledWith('loading')
      fireEvent.error(container.querySelector('img')!)
      expect(onChange).toHaveBeenCalledWith('error')
    })

    it('renders the loading render-prop while the image is pending', () => {
      render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="https://x/a.jpg">
              {(status) => <span>status:{status}</span>}
            </Avatar.Image>
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByText('status:loading')).toBeInTheDocument()
    })
  })

  describe('unmanaged errors', () => {
    it('treats an empty src as a missing image (skips to the next candidate)', () => {
      render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Image src="" />
            <Avatar.Initials>JD</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('throws when a sub-component is used outside <Avatar>', () => {
      // useAvatarConfig guards against orphaned sub-components.
      expect(() => render(<Avatar.Icon />)).toThrow(/within <Avatar>/)
    })
  })

  describe('edge cases', () => {
    it('truncates initials to the first 2 characters', () => {
      render(
        <Avatar aria-label="Jane">
          <Avatar.Fallback>
            <Avatar.Initials>JDS</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders unicode initials truncated to 2 characters', () => {
      render(
        <Avatar aria-label="Émile">
          <Avatar.Fallback>
            <Avatar.Initials>ÉÑ</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
      )
      expect(screen.getByText('ÉÑ')).toBeInTheDocument()
    })

    it('throws when a candidate is used outside <Avatar.Fallback>', () => {
      // Candidates are meaningless without the resolution cascade.
      expect(() =>
        render(
          <Avatar aria-label="Jane">
            <Avatar.Image src="https://x/a.jpg" />
          </Avatar>
        )
      ).toThrow(/<Avatar\.Fallback>/)
    })
  })
})
