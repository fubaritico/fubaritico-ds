import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Dropdown } from './Dropdown'

import type { DropdownOption } from './Dropdown.types'

const OPTIONS: DropdownOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
]

/** Trigger button accessible name = `${label}: ${selectedLabel}` by default. */
const TRIGGER_NAME = 'Sort by: Alpha'

afterEach(cleanup)

describe('Dropdown', () => {
  describe('happy path', () => {
    it('renders the trigger with the selected label', () => {
      render(
        <Dropdown
          label="Sort by"
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
        />
      )
      expect(
        screen.getByRole('button', { name: TRIGGER_NAME })
      ).toBeInTheDocument()
    })

    it('opens the menu on trigger click and shows the options', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      expect(screen.queryByText('Beta')).toBeNull()
      await user.click(screen.getByRole('button'))
      expect(screen.getByText('Beta')).toBeInTheDocument()
    })

    it('calls onSelect with the value when an option is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={onSelect} />
      )
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Beta'))
      expect(onSelect).toHaveBeenCalledWith('b')
    })
  })

  describe('variants', () => {
    it('reflects open state via aria-expanded', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('exposes a listbox popup on the trigger', () => {
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      )
    })

    it('renders a leading colour dot for options that define one', async () => {
      const user = userEvent.setup()
      const colored: DropdownOption[] = [
        { value: 'g', label: 'Green', color: 'green' },
      ]
      const { container } = render(
        <Dropdown options={colored} selectedValue="g" onSelect={vi.fn()} />
      )
      await user.click(screen.getByRole('button'))
      expect(
        container.ownerDocument.querySelector('.ui-dropdown__dot')
      ).not.toBeNull()
    })

    it('renders the menu in a portal when withPortal is set', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Dropdown
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
          withPortal
        />
      )
      await user.click(screen.getByRole('button'))
      // the option text is in the document but NOT inside the component's container subtree
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(container.contains(screen.getByText('Beta'))).toBe(false)
    })
  })

  describe('managed errors', () => {
    it('does not select a disabled option', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={onSelect} />
      )
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Gamma'))
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('keeps the menu closed initially', () => {
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      expect(screen.queryByText('Beta')).toBeNull()
    })

    it('closes the menu on outside click', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
          <button type="button">outside</button>
        </div>
      )
      await user.click(screen.getByRole('button', { name: 'Select: Alpha' }))
      expect(screen.getByText('Beta')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'outside' }))
      expect(screen.queryByText('Beta')).toBeNull()
    })
  })

  describe('unmanaged errors', () => {
    it('opens an empty menu without crashing when there are no options', async () => {
      const user = userEvent.setup()
      render(<Dropdown options={[]} selectedValue="" onSelect={vi.fn()} />)
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('falls back to the raw value when no option matches the selection', () => {
      render(
        <Dropdown
          options={OPTIONS}
          selectedValue="missing"
          onSelect={vi.fn()}
        />
      )
      expect(
        screen.getByRole('button', { name: 'Select: missing' })
      ).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders a custom trigger', () => {
      render(
        <Dropdown
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
          trigger={({ selectedLabel }) => <span>Custom: {selectedLabel}</span>}
        />
      )
      expect(screen.getByText('Custom: Alpha')).toBeInTheDocument()
    })

    it('renders items with a custom renderItem', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
          renderItem={(option) => <span>★ {option.label}</span>}
        />
      )
      await user.click(screen.getByRole('button'))
      expect(screen.getByText('★ Beta')).toBeInTheDocument()
    })

    it('inserts a separator before an option flagged dividerBefore', async () => {
      const user = userEvent.setup()
      const withDivider: DropdownOption[] = [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta', dividerBefore: true },
      ]
      render(
        <Dropdown options={withDivider} selectedValue="a" onSelect={vi.fn()} />
      )
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })
  })
})
