import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Tabs from './Tabs'
import TabsPanel from './TabsPanel'

describe('TabsPanel', () => {
  it('renders children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">
          <span>Panel content</span>
        </TabsPanel>
      </Tabs>
    )

    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('renders with role="tabpanel"', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('is visible when value matches active tab', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">
          <span>Active content</span>
        </TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).not.toHaveAttribute('hidden')
  })

  it('is hidden when value does not match active tab', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab2">
          <span>Inactive content</span>
        </TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveAttribute('hidden')
  })

  it('sets correct id without prefix', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveAttribute('id', 'tabpanel-tab1')
  })

  it('sets correct id with prefix', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" prefix="popular">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveAttribute('id', 'tabpanel-popular-tab1')
  })

  it('sets correct aria-labelledby without prefix', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1')
  })

  it('sets correct aria-labelledby with prefix', () => {
    const { container } = render(
      <Tabs defaultValue="tab1" prefix="popular">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-popular-tab1')
  })

  it('forwards className', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1" className="custom-class">
          Content
        </TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveClass('custom-class')
  })

  it('renders with default mt-4 class', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">Content</TabsPanel>
      </Tabs>
    )

    const panel = container.querySelector('[role="tabpanel"]')
    expect(panel).toHaveClass('ui:mt-4')
  })

  it('shows content for multiple panels and hides inactive ones', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsPanel value="tab1">
          <span>Content 1</span>
        </TabsPanel>
        <TabsPanel value="tab2">
          <span>Content 2</span>
        </TabsPanel>
      </Tabs>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    const panels = container.querySelectorAll('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    expect(panels[0]).not.toHaveAttribute('hidden')
    expect(panels[1]).toHaveAttribute('hidden')
  })
})
