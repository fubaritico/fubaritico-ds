import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Tabs from './Tabs'
import TabsPanel from './TabsPanel'

describe('TabsPanel', () => {
  describe('happy path', () => {
    it('renders its children in a tabpanel', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1">
            <span>Panel content</span>
          </TabsPanel>
        </Tabs>
      )
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel content')
    })
  })

  describe('variants', () => {
    it('is shown when its value is selected, hidden otherwise', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1">Content 1</TabsPanel>
          <TabsPanel value="tab2">Content 2</TabsPanel>
        </Tabs>
      )
      const panels = container.querySelectorAll('[role="tabpanel"]')
      expect(panels).toHaveLength(2)
      expect(panels[0]).not.toHaveAttribute('hidden')
      expect(panels[1]).toHaveAttribute('hidden')
      // Hidden panels stay mounted: their state survives a tab switch.
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('derives its id and label from the prefix when given', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" prefix="popular">
          <TabsPanel value="tab1">Content</TabsPanel>
        </Tabs>
      )
      const panel = container.querySelector('[role="tabpanel"]')
      expect(panel).toHaveAttribute('id', 'tabpanel-popular-tab1')
      expect(panel).toHaveAttribute('aria-labelledby', 'tab-popular-tab1')
    })

    it('is focusable, as the APG requires for a panel without focusable content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1">Content</TabsPanel>
        </Tabs>
      )
      expect(screen.getByRole('tabpanel')).toHaveAttribute('tabIndex', '0')
    })

    it('drops its tab stop when focusable is false', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1" focusable={false}>
            <a href="#x">First focusable</a>
          </TabsPanel>
        </Tabs>
      )
      expect(screen.getByRole('tabpanel')).not.toHaveAttribute('tabIndex')
    })

    it('wears the panel element class and forwards className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1" className="custom-class">
            Content
          </TabsPanel>
        </Tabs>
      )
      expect(screen.getByRole('tabpanel')).toHaveClass(
        'ui-tabs__panel',
        'custom-class'
      )
    })
  })

  describe('managed errors', () => {
    it('throws outside <Tabs>', () => {
      // React logs the thrown render error; silence it for this test only.
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      expect(() => render(<TabsPanel value="x">X</TabsPanel>)).toThrow(
        'Tabs compound components must be used within <Tabs>'
      )
      consoleError.mockRestore()
    })
  })

  // L4: N/A — a panel only reads the selection; no input to malform.

  describe('edge cases', () => {
    it('shows the intended panel before any trigger exists (first / server render)', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsPanel value="tab1">Content</TabsPanel>
        </Tabs>
      )
      expect(screen.getByRole('tabpanel')).not.toHaveAttribute('hidden')
    })

    it('gets a unique id without prefix, still pointing at its trigger id', () => {
      render(
        <Tabs defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          </Tabs.List>
          <TabsPanel value="tab1">Content</TabsPanel>
        </Tabs>
      )
      const trigger = screen.getByRole('tab')
      const panel = screen.getByRole('tabpanel')
      expect(panel.id).toMatch(/^tabpanel-.+-tab1$/)
      expect(panel).toHaveAttribute('aria-labelledby', trigger.id)
    })
  })
})
