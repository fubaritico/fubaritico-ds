import { useRef, useState } from 'react'

// Tooltip — CSS-free subpath (no Tailwind leak in Storybook).
import { Tooltip } from '@fubaritico-ds/reference/Tooltip'

import type {
  TooltipPlacement,
  TooltipProps,
} from '@fubaritico-ds/reference/Tooltip'
import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Tooltip — a controlled, portalled floating bubble that anchors to a target (with viewport-aware
 * flipping) or to explicit coordinates. The parent owns `visible`; the skin owns the look
 * (`@fubaritico-ds/variants` → `.ui-tooltip` + `.ui-tooltip__arrow`).
 */
const meta = {
  title: 'Reference/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['dark', 'light'] },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        'left',
        'left-top',
        'left-bottom',
        'right',
        'right-top',
        'right-bottom',
      ],
    },
    offset: { control: 'number' },
    width: { control: 'number' },
  },
  args: {
    content: 'Save your changes',
    variant: 'dark',
    placement: 'top',
    // Required prop — the stories drive visibility via hover/focus state in a wrapper.
    visible: false,
  },
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

/** A hover/focus-driven trigger wired to a controlled Tooltip — the real-world pattern. */
function TooltipDemo({
  content,
  ...args
}: Omit<TooltipProps, 'visible' | 'targetRef'>) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby="demo-tip"
        className="ui-button"
        onMouseEnter={() => {
          setOpen(true)
        }}
        onMouseLeave={() => {
          setOpen(false)
        }}
        onFocus={() => {
          setOpen(true)
        }}
        onBlur={() => {
          setOpen(false)
        }}
      >
        Hover or focus me
      </button>
      <Tooltip {...args} content={content} visible={open} targetRef={ref} />
    </>
  )
}

/** Interactive playground — hover/focus the button to show the tooltip. */
export const Playground: Story = {
  render: ({ content, variant, placement, offset, width }) => (
    <TooltipDemo
      content={content}
      variant={variant}
      placement={placement}
      offset={offset}
      width={width}
    />
  ),
}

/** Several placements + both variants in one view. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, auto)',
        gap: '4rem',
        padding: '4rem',
      }}
    >
      {(['top', 'bottom', 'left', 'right'] as TooltipPlacement[]).map((p) => (
        <TooltipDemo key={p} content={`Placement: ${p}`} placement={p} />
      ))}
      <TooltipDemo content="Light variant" variant="light" placement="top" />
      <TooltipDemo
        content="A wider, multi-line tooltip that wraps its text"
        width={180}
        placement="bottom"
      />
    </div>
  ),
}
