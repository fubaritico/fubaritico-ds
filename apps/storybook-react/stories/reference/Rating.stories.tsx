// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Rating } from '@fubaritico-ds/reference/Rating'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Rating — a display-only, grayscale score readout migrated to the native BEM skin
 * (`@fubaritico-ds/styles`); the look/size resolve to BEM classes via `@fubaritico-ds/variants`. Two
 * looks (`circle` ring, `stars` row); the score is read from the fill proportion AND the number, never
 * from colour — so the palette stays grayscale with no loss of information.
 */
const meta = {
  title: 'Reference/Rating',
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['circle', 'stars'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'number', step: 0.5 } },
    max: { control: 'inline-radio', options: [10, 100] },
    showValue: { control: 'boolean' },
  },
  args: {
    variant: 'circle',
    size: 'md',
    value: 7.5,
    max: 10,
    showValue: true,
  },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Both looks across every size + scale, plus the score-range boundaries; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Circle look — every size */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Rating value={7.5} variant="circle" size="sm" />
        <Rating value={7.5} variant="circle" size="md" />
        <Rating value={7.5} variant="circle" size="lg" />
      </div>

      {/* Stars look — every size */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Rating value={7.5} variant="stars" size="sm" />
        <Rating value={7.5} variant="stars" size="md" />
        <Rating value={7.5} variant="stars" size="lg" />
      </div>

      {/* Percentage scale (ring shows 75, stars show 7.5) */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Rating value={75} max={100} variant="circle" />
        <Rating value={75} max={100} variant="stars" />
      </div>

      {/* Score boundaries + value hidden */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Rating value={0} variant="circle" />
        <Rating value={10} max={10} variant="circle" />
        <Rating value={7.5} variant="stars" showValue={false} />
      </div>
    </div>
  ),
}
