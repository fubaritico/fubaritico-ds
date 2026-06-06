import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Menu from './Menu'

const renderMenu = (props: Partial<React.ComponentProps<typeof Menu>> = {}) =>
  render(
    <Menu onSelect={vi.fn()} {...props}>
      <Menu.Item index={0} value="apple">
        Apple
      </Menu.Item>
      <Menu.Item index={1} value="banana">
        Banana
      </Menu.Item>
      <Menu.Item index={2} value="cherry">
        Cherry
      </Menu.Item>
    </Menu>
  )

describe('Menu', () => {
  // --- Rendering ---

  it('should render a listbox', () => {
    renderMenu()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should render all items as options', () => {
    renderMenu()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('should render item text content', () => {
    renderMenu()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('should apply custom className to listbox', () => {
    renderMenu({ className: 'custom-class' })
    expect(screen.getByRole('listbox')).toHaveClass('custom-class')
  })

  // --- Selection ---

  it('should call onSelect when clicking an item', async () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    await userEvent.click(screen.getByText('Banana'))
    expect(onSelect).toHaveBeenCalledWith('banana')
  })

  it('should mark selected item with aria-selected', () => {
    renderMenu({ selectedValue: 'banana' })
    expect(
      screen.getByText('Banana').closest('[role="option"]')
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('should not mark non-selected items with aria-selected true', () => {
    renderMenu({ selectedValue: 'banana' })
    expect(
      screen.getByText('Apple').closest('[role="option"]')
    ).toHaveAttribute('aria-selected', 'false')
  })

  // --- Disabled ---

  it('should not call onSelect for disabled items', async () => {
    const onSelect = vi.fn()
    render(
      <Menu onSelect={onSelect}>
        <Menu.Item index={0} value="apple" disabled>
          Apple
        </Menu.Item>
      </Menu>
    )
    await userEvent.click(screen.getByText('Apple'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should set aria-disabled on disabled items', () => {
    render(
      <Menu>
        <Menu.Item index={0} value="apple" disabled>
          Apple
        </Menu.Item>
      </Menu>
    )
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true')
  })

  // --- Keyboard Navigation ---

  it('should move to first item on ArrowDown when no active item', async () => {
    renderMenu()
    const listbox = screen.getByRole('listbox')
    await userEvent.tab()
    expect(listbox).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(listbox).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should move down through items with ArrowDown', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-1')
    )
  })

  it('should wrap to first item when ArrowDown at end', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should move up through items with ArrowUp', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should wrap to last item when ArrowUp at start', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowUp}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2')
    )
  })

  it('should jump to first item on Home', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Home}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should jump to last item on End', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('listbox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2')
    )
  })

  it('should select active item on Enter', async () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith('banana')
  })

  it('should select active item on Space', async () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ }')
    expect(onSelect).toHaveBeenCalledWith('banana')
  })

  it('should call onClose on Escape', async () => {
    const onClose = vi.fn()
    renderMenu({ onClose })
    await userEvent.tab()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should skip disabled items during keyboard navigation', async () => {
    const onSelect = vi.fn()
    render(
      <Menu onSelect={onSelect}>
        <Menu.Item index={0} value="apple">
          Apple
        </Menu.Item>
        <Menu.Item index={1} value="banana" disabled>
          Banana
        </Menu.Item>
        <Menu.Item index={2} value="cherry">
          Cherry
        </Menu.Item>
      </Menu>
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith('cherry')
  })

  // --- data-active ---

  it('should set data-active on the active item', async () => {
    renderMenu()
    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    expect(
      screen.getByText('Apple').closest('[role="option"]')
    ).toHaveAttribute('data-active')
  })

  it('should not set data-active on inactive items', () => {
    renderMenu()
    expect(
      screen.getByText('Apple').closest('[role="option"]')
    ).not.toHaveAttribute('data-active')
  })

  // --- Variant ---

  it('should apply dark styles to listbox', () => {
    renderMenu({ variant: 'dark' })
    expect(screen.getByRole('listbox')).toHaveClass('ui:bg-neutral-900')
  })

  it('should apply dark text to items', () => {
    render(
      <Menu variant="dark">
        <Menu.Item index={0} value="apple">
          Apple
        </Menu.Item>
      </Menu>
    )
    expect(screen.getByRole('option')).toHaveClass('ui:text-neutral-200')
  })

  it('should apply light styles by default', () => {
    renderMenu()
    expect(screen.getByRole('listbox')).toHaveClass('ui:bg-popover')
  })

  // --- Context error ---

  it('should throw if Menu.Item is used outside Menu', () => {
    expect(() =>
      render(
        <Menu.Item index={0} value="test">
          Test
        </Menu.Item>
      )
    ).toThrow('Menu.Item must be used within Menu')
  })
})
