import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createTabsService } from '@fubaritico-ds/behaviors'

import Tabs from './Tabs'

import type { TabsProps } from './Tabs'

/** Three tabs with their panels; `disabled` lists the values to disable. */
function ThreeTabs({
  disabled = [],
  ...props
}: Partial<TabsProps> & { disabled?: string[] }) {
  return (
    <Tabs {...props}>
      <Tabs.List>
        {['tab1', 'tab2', 'tab3'].map((value, i) => (
          <Tabs.Trigger
            key={value}
            value={value}
            disabled={disabled.includes(value)}
          >
            Tab {i + 1}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
      <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
      <Tabs.Panel value="tab3">Panel 3</Tabs.Panel>
    </Tabs>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })

describe('Tabs', () => {
  describe('happy path', () => {
    it('renders the tablist, the tabs and the selected panel', () => {
      render(<ThreeTabs defaultValue="tab1" />)
      expect(screen.getByRole('tablist')).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      )
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 1')
    })

    it('selects on click and reports the value', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<ThreeTabs defaultValue="tab1" onValueChange={onValueChange} />)
      await user.click(tab('Tab 2'))
      expect(tab('Tab 2')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel 2')
      expect(onValueChange).toHaveBeenCalledWith('tab2')
    })

    it('links each tab to its panel', () => {
      render(<ThreeTabs defaultValue="tab1" />)
      const panel = screen.getByRole('tabpanel')
      expect(tab('Tab 1')).toHaveAttribute('aria-controls', panel.id)
      expect(panel).toHaveAttribute('aria-labelledby', tab('Tab 1').id)
    })
  })

  describe('variants', () => {
    it.each(['underline', 'pills'] as const)(
      'renders the %s look',
      (variant) => {
        render(<ThreeTabs defaultValue="tab1" variant={variant} />)
        expect(tab('Tab 1')).toHaveClass(`ui-tabs__trigger--${variant}`)
      }
    )

    it('keeps the roving tabindex on the selected tab only', () => {
      render(<ThreeTabs defaultValue="tab1" />)
      expect(tab('Tab 1')).toHaveAttribute('tabIndex', '0')
      expect(tab('Tab 2')).toHaveAttribute('tabIndex', '-1')
      expect(tab('Tab 3')).toHaveAttribute('tabIndex', '-1')
    })

    it('follows a controlled value', () => {
      const { rerender } = render(<ThreeTabs value="tab2" />)
      expect(tab('Tab 2')).toHaveAttribute('aria-selected', 'true')
      rerender(<ThreeTabs value="tab3" />)
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
    })

    it('in controlled mode reports the click but waits for the parent', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<ThreeTabs value="tab1" onValueChange={onValueChange} />)
      await user.click(tab('Tab 2'))
      expect(onValueChange).toHaveBeenCalledWith('tab2')
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
    })

    it('round-trips a controlled value through state', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [value, setValue] = useState('tab1')
        return <ThreeTabs value={value} onValueChange={setValue} />
      }
      render(<Controlled />)
      await user.click(tab('Tab 3'))
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
    })

    it.each([
      ['{ArrowRight}', 'tab1', 'Tab 2'],
      ['{ArrowLeft}', 'tab2', 'Tab 1'],
      ['{Home}', 'tab3', 'Tab 1'],
      ['{End}', 'tab1', 'Tab 3'],
      ['{ArrowLeft}', 'tab1', 'Tab 3'],
      ['{ArrowRight}', 'tab3', 'Tab 1'],
    ])('%s from %s selects AND focuses %s', async (keys, from, to) => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue={from} />)
      screen.getByRole('tab', { selected: true }).focus()
      await user.keyboard(keys)
      expect(tab(to)).toHaveAttribute('aria-selected', 'true')
      expect(tab(to)).toHaveFocus()
    })

    it('in manual activation, arrows move focus and Enter selects', async () => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue="tab1" activation="manual" />)
      tab('Tab 1').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Tab 2')).toHaveFocus()
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
      await user.keyboard('{Enter}')
      expect(tab('Tab 2')).toHaveAttribute('aria-selected', 'true')
    })

    it('swaps the horizontal arrows under dir="rtl"', async () => {
      const user = userEvent.setup()
      render(
        <div dir="rtl">
          <ThreeTabs defaultValue="tab1" />
        </div>
      )
      tab('Tab 1').focus()
      await user.keyboard('{ArrowLeft}')
      expect(tab('Tab 2')).toHaveAttribute('aria-selected', 'true')
    })

    it('re-enters on the selected tab after leaving the row (manual activation)', async () => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue="tab1" activation="manual" />)
      tab('Tab 1').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Tab 2')).toHaveFocus()
      // Tab leaves the row for the (focusable) selected panel.
      await user.tab()
      expect(screen.getByRole('tabpanel')).toHaveFocus()
      expect(tab('Tab 1')).toHaveAttribute('tabIndex', '0')
      expect(tab('Tab 2')).toHaveAttribute('tabIndex', '-1')
    })

    it('drives an injected service from outside the tree', async () => {
      const service = createTabsService({ uid: 'ext', defaultActiveId: 'tab1' })
      render(<ThreeTabs service={service} />)
      expect(tab('Tab 1')).toHaveAttribute('id', 'tab-ext-tab1')
      act(() => {
        service.setActive('tab3')
      })
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
    })

    it('forwards an accessible name to the tablist', () => {
      render(
        <Tabs defaultValue="a">
          <Tabs.List aria-label="Account settings">
            <Tabs.Trigger value="a">A</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      )
      expect(screen.getByRole('tablist', { name: 'Account settings' })).toBeInTheDocument()
    })

    it('stops at the ends when loop is off', async () => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue="tab3" loop={false} />)
      tab('Tab 3').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
    })

    it('uses the prefix in the ids when given', () => {
      render(<ThreeTabs defaultValue="tab1" prefix="popular" />)
      expect(tab('Tab 1')).toHaveAttribute('id', 'tab-popular-tab1')
      expect(tab('Tab 1')).toHaveAttribute(
        'aria-controls',
        'tabpanel-popular-tab1'
      )
    })

    it('renders a leading icon', () => {
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1" icon={<span data-testid="icon" />}>
              Tab 1
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('renders a disabled tab as a disabled button that cannot be selected', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <ThreeTabs
          defaultValue="tab1"
          disabled={['tab2']}
          onValueChange={onValueChange}
        />
      )
      expect(tab('Tab 2')).toBeDisabled()
      await user.click(tab('Tab 2'))
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('skips disabled tabs with the arrow keys', async () => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue="tab1" disabled={['tab2']} />)
      tab('Tab 1').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
    })

    it('leaves modified arrows (Alt+Arrow, Ctrl+Arrow) to the browser', async () => {
      const user = userEvent.setup()
      render(<ThreeTabs defaultValue="tab1" />)
      tab('Tab 1').focus()
      await user.keyboard('{Alt>}{ArrowRight}{/Alt}')
      await user.keyboard('{Control>}{ArrowRight}{/Control}')
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
    })

    it('lets a consumer onClick prevent the selection', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger
              value="tab2"
              onClick={(event) => event.preventDefault()}
            >
              Tab 2
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      )
      await user.click(tab('Tab 2'))
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
    })

    it('throws when a part is used outside <Tabs>', () => {
      // React logs the thrown render error; silence it for this test only.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      expect(() => render(<Tabs.Trigger value="x">X</Tabs.Trigger>)).toThrow(
        'Tabs compound components must be used within <Tabs>'
      )
      consoleError.mockRestore()
    })
  })

  describe('unmanaged errors', () => {
    it('selects nothing for a controlled value matching no tab', () => {
      render(<ThreeTabs value="ghost" />)
      expect(screen.queryByRole('tab', { selected: true })).toBeNull()
    })

    it('falls back to the first tab for a defaultValue matching no tab', () => {
      render(<ThreeTabs defaultValue="ghost" />)
      expect(tab('Tab 1')).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('edge cases', () => {
    it('does not call onValueChange while the initial selection resolves', () => {
      const onValueChange = vi.fn()
      render(<ThreeTabs defaultValue="tab2" onValueChange={onValueChange} />)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('works under StrictMode (double mount)', async () => {
      const user = userEvent.setup()
      render(
        <StrictMode>
          <ThreeTabs defaultValue="tab1" />
        </StrictMode>
      )
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      tab('Tab 1').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Tab 2')).toHaveAttribute('aria-selected', 'true')
    })

    it('generates distinct ids for two instances without prefix', () => {
      render(
        <>
          <ThreeTabs defaultValue="tab1" />
          <ThreeTabs defaultValue="tab1" />
        </>
      )
      const ids = screen.getAllByRole('tab').map((t) => t.id)
      expect(new Set(ids).size).toBe(6)
    })

    it('selects the neighbour when the active tab is removed, and reports it', () => {
      const onValueChange = vi.fn()
      function Removable({ withSecond }: { withSecond: boolean }) {
        return (
          <Tabs defaultValue="tab2" onValueChange={onValueChange}>
            <Tabs.List>
              <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
              {withSecond ? (
                <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
              ) : null}
              <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        )
      }
      const { rerender } = render(<Removable withSecond />)
      rerender(<Removable withSecond={false} />)
      expect(tab('Tab 3')).toHaveAttribute('aria-selected', 'true')
      expect(onValueChange).toHaveBeenCalledWith('tab3')
    })

    it('keeps a consumer ref on the trigger', () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1" ref={ref}>
              Tab 1
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      )
      expect(ref.current).toBe(tab('Tab 1'))
    })

    it('renders a single tab, the arrows staying put', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="only">
          <Tabs.List>
            <Tabs.Trigger value="only">Only</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      )
      tab('Only').focus()
      await user.keyboard('{ArrowRight}')
      expect(tab('Only')).toHaveAttribute('aria-selected', 'true')
    })
  })
})
