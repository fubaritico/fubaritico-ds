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

    it('moves focus into the menu on open, and back to the trigger on Escape', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      const trigger = screen.getByRole('button')
      await user.click(trigger)
      expect(screen.getByRole('listbox')).toHaveFocus()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(trigger).toHaveFocus()
    })

    it('opens with Arrow Down on the trigger, the cursor on the selected option', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown options={OPTIONS} selectedValue="b" onSelect={onSelect} />
      )
      screen.getByRole('button').focus()
      await user.keyboard('{ArrowDown}')
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveFocus()
      const active = listbox.getAttribute('aria-activedescendant')
      expect(active && document.getElementById(active)).toHaveTextContent(
        'Beta'
      )
      await user.keyboard('{Enter}')
      expect(onSelect).toHaveBeenCalledWith('b')
    })

    it('names the listbox after the trigger unless menuAriaLabel is given', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <Dropdown
          label="Sort by"
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
        />
      )
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toHaveAccessibleName(TRIGGER_NAME)
      rerender(
        <Dropdown
          label="Sort by"
          menuAriaLabel="Orders"
          options={OPTIONS}
          selectedValue="a"
          onSelect={vi.fn()}
        />
      )
      expect(screen.getByRole('listbox')).toHaveAccessibleName('Orders')
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
      expect(trigger).not.toHaveAttribute('aria-controls')
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute(
        'aria-controls',
        screen.getByRole('listbox').id
      )
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

    it('ties the menu to its control with one anchor name per instance', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <>
          <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
          <Dropdown options={OPTIONS} selectedValue="b" onSelect={vi.fn()} />
        </>
      )
      const roots = container.querySelectorAll<HTMLElement>('.ui-dropdown')
      const anchors = [...roots].map((root) =>
        root.style.getPropertyValue('--ui-dropdown-anchor')
      )
      expect(anchors[0]).toMatch(/^--ui-dropdown-[\w-]+$/)
      expect(anchors[0]).not.toBe(anchors[1])
      await user.click(screen.getByRole('button', { name: 'Select: Alpha' }))
      const menu = container.querySelector<HTMLElement>('.ui-dropdown__menu')
      expect(menu).toHaveAttribute('popover', 'manual')
      expect(menu?.style.getPropertyValue('--ui-dropdown-anchor')).toBe(
        anchors[0]
      )
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

    it('closes the menu when focus leaves it, without pulling focus back', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
          <button type="button">after</button>
        </div>
      )
      await user.click(screen.getByRole('button', { name: 'Select: Alpha' }))
      await user.tab()
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
    })

    it('closes the menu and refocuses the trigger when the trigger is clicked again', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown options={OPTIONS} selectedValue="a" onSelect={vi.fn()} />
      )
      const trigger = screen.getByRole('button')
      await user.click(trigger)
      await user.click(trigger)
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(trigger).toHaveFocus()
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
