import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import Tabs from './Tabs'

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
  })

  it('renders with underline variant by default', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    expect(firstTab).toHaveClass('ui:border-b-2')
  })

  it('renders with pills variant', () => {
    render(
      <Tabs defaultValue="tab1" variant="pills">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    expect(firstTab).toHaveClass('ui:rounded-md')
  })

  it('sets first tab as active by default', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    expect(firstTab).toHaveAttribute('aria-selected', 'true')
    expect(firstTab).toHaveAttribute('tabIndex', '0')
  })

  it('handles controlled active tab', () => {
    render(
      <Tabs value="tab2">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })
    expect(secondTab).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onValueChange when tab is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <Tabs defaultValue="tab1" onValueChange={handleChange}>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })
    await user.click(secondTab)

    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('updates active tab on click in uncontrolled mode', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })
    await user.click(secondTab)

    expect(secondTab).toHaveAttribute('aria-selected', 'true')
  })

  it('renders disabled tab', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2" disabled>
            Tab 2
          </Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const disabledTab = screen.getByRole('tab', { name: 'Tab 2' })
    expect(disabledTab).toBeDisabled()
  })

  it('does not call onValueChange when disabled tab is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <Tabs defaultValue="tab1" onValueChange={handleChange}>
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2" disabled>
            Tab 2
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const disabledTab = screen.getByRole('tab', { name: 'Tab 2' })
    await user.click(disabledTab)

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('renders tab with icon', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger
            value="tab1"
            icon={<span data-testid="icon">Icon</span>}
          >
            Tab 1
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('navigates with arrow right key', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })

    firstTab.focus()
    await user.keyboard('{ArrowRight}')

    expect(secondTab).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates with arrow left key', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab2">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })

    secondTab.focus()
    await user.keyboard('{ArrowLeft}')

    await waitFor(() => {
      expect(firstTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('navigates to first tab with Home key', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab3">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    thirdTab.focus()
    await user.keyboard('{Home}')

    await waitFor(() => {
      expect(firstTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('navigates to last tab with End key', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    firstTab.focus()
    await user.keyboard('{End}')

    expect(thirdTab).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps to last tab when pressing arrow left on first tab', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    firstTab.focus()
    await user.keyboard('{ArrowLeft}')

    expect(thirdTab).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps to first tab when pressing arrow right on last tab', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab3">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    thirdTab.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(firstTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('skips disabled tabs when navigating with keyboard', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2" disabled>
            Tab 2
          </Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    firstTab.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(thirdTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('sets correct ARIA attributes', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const firstTab = screen.getByRole('tab', { name: 'Tab 1' })

    expect(firstTab).toHaveAttribute('id', 'tab-tab1')
    expect(firstTab).toHaveAttribute('aria-controls', 'tabpanel-tab1')
    expect(firstTab).toHaveAttribute('role', 'tab')
  })

  it('sets tabIndex to -1 for inactive tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )

    const secondTab = screen.getByRole('tab', { name: 'Tab 2' })
    const thirdTab = screen.getByRole('tab', { name: 'Tab 3' })

    expect(secondTab).toHaveAttribute('tabIndex', '-1')
    expect(thirdTab).toHaveAttribute('tabIndex', '-1')
  })
})
