import { TruncatedText } from '@fubaritico/react/TruncatedText'

import type { TruncatedTextProps } from '@fubaritico/react/TruncatedText'
import type { Meta, StoryObj } from '@storybook/react-vite'

const LONG = 'The Holy Roman Empire of the German Nation, from 962 to 1806'

/** Playground args: the component's own, plus the width of the box it sits in. */
type PlaygroundArgs = TruncatedTextProps & {
  /** Width of the containing box, in px — narrow it to see the cut and the tooltip appear. */
  boxWidth: number
}

const meta = {
  title: 'Reference/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    as: { control: 'inline-radio', options: ['span', 'div', 'p'] },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    tooltipVariant: { control: 'inline-radio', options: ['dark', 'light'] },
  },
  args: {
    children: LONG,
    as: 'span',
    placement: 'top',
    tooltipVariant: 'dark',
  },
} satisfies Meta<typeof TruncatedText>

export default meta
type Story = StoryObj<PlaygroundArgs>

/**
 * Resize the box: the tooltip (hover, or Tab to focus) only exists while the text is actually cut.
 */
export const Playground: Story = {
  args: { boxWidth: 200 },
  argTypes: {
    boxWidth: { control: { type: 'range', min: 60, max: 600, step: 10 } },
  },
  render: ({ boxWidth, ...args }) => (
    <div
      style={{
        inlineSize: `${String(boxWidth)}px`,
        padding: '0.5rem',
        border: '1px dashed var(--color-border)',
      }}
    >
      <TruncatedText {...args} />
    </div>
  ),
}

/** Cut vs fitting, the element variants, a table cell, the light tooltip and another placement. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const box = (width: number) => ({
      inlineSize: `${String(width)}px`,
      padding: '0.5rem',
      border: '1px dashed var(--color-border)',
    })
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '3rem 1rem',
        }}
      >
        <div>
          <strong>Cut — hover it, or Tab to it</strong>
          <div style={box(180)}>
            <TruncatedText>{LONG}</TruncatedText>
          </div>
        </div>
        <div>
          <strong>Fits — plain text: no tooltip, no tab stop</strong>
          <div style={box(520)}>
            <TruncatedText>{LONG}</TruncatedText>
          </div>
        </div>
        <div>
          <strong>As a paragraph</strong>
          <div style={box(180)}>
            <TruncatedText as="p">{LONG}</TruncatedText>
          </div>
        </div>
        <div>
          <strong>In a table cell</strong>
          <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td
                  style={{
                    ...box(140),
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <TruncatedText>{LONG}</TruncatedText>
                </td>
                <td style={{ padding: '0.5rem' }}>962–1806</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <strong>Light tooltip, placed below</strong>
          <div style={box(180)}>
            <TruncatedText tooltipVariant="light" placement="bottom">
              {LONG}
            </TruncatedText>
          </div>
        </div>
      </div>
    )
  },
}
