import { ProgressBar } from '@fubaritico-ds/reference/ProgressBar'

import type { Meta, StoryObj } from '@storybook/react-vite'

/** The bar has no intrinsic width — give every story a container to stretch into. */
const WIDTH = '20rem'

const meta = {
  title: 'Reference/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: 'number' },
    variant: {
      control: 'inline-radio',
      options: ['default', 'success', 'destructive'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    valueText: { control: 'text' },
    metaStart: { control: 'text' },
    metaEnd: { control: 'text' },
    'aria-labelledby': { table: { disable: true } },
  },
  args: {
    value: 62,
    max: 100,
    variant: 'default',
    size: 'md',
    'aria-label': 'Upload progress',
  },
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground — driven by the controls panel. */
export const Playground: Story = {}

/** Every variant, size, legend and boundary case in one view. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Variants</strong>
        <ProgressBar value={62} aria-label="Default" />
        <ProgressBar value={100} variant="success" aria-label="Success" />
        <ProgressBar
          value={85}
          variant="destructive"
          aria-label="Destructive"
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Sizes</strong>
        <ProgressBar value={40} size="sm" aria-label="Small" />
        <ProgressBar value={40} size="md" aria-label="Medium" />
        <ProgressBar value={40} size="lg" aria-label="Large" />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Legend slots</strong>
        <ProgressBar
          value={62}
          aria-label="Both slots"
          metaStart="62%"
          metaEnd="3 days left"
        />
        <ProgressBar
          value={10}
          aria-label="Trailing only"
          metaEnd="starting…"
        />
        <ProgressBar
          value={1.2}
          max={4}
          valueText="1.2 GB of 4 GB"
          aria-label="Storage quota"
          metaStart={<strong>1.2 GB</strong>}
          metaEnd="of 4 GB"
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Boundaries</strong>
        <ProgressBar value={0} aria-label="Empty" metaEnd="0%" />
        <ProgressBar value={100} aria-label="Complete" metaEnd="100%" />
        <ProgressBar
          value={150}
          aria-label="Clamped above max"
          metaEnd="clamped"
        />
        <ProgressBar
          value={5}
          max={0}
          aria-label="No usable range"
          metaEnd="max = 0"
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Right-to-left</strong>
        <div dir="rtl">
          <ProgressBar
            value={62}
            aria-label="RTL"
            metaStart="٦٢٪"
            metaEnd="٣ أيام"
          />
        </div>
      </section>
    </div>
  ),
}
