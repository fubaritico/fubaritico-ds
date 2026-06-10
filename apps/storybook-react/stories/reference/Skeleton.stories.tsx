// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Skeleton } from '@fubaritico-ds/reference/Skeleton'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Skeleton — loading placeholder migrated to the native BEM skin (`@fubaritico-ds/styles`); the shape
 * resolves to a BEM class via `@fubaritico-ds/variants`. It has no intrinsic size — give it a
 * `width`/`height` (or an `aspectRatio` with one dimension) to make the block visible.
 */
const meta = {
  title: 'Reference/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['rectangle', 'circle', 'line'],
    },
    rounded: { control: 'boolean' },
    width: { control: 'text' },
    height: { control: 'text' },
    aspectRatio: { control: 'text' },
  },
  args: {
    variant: 'rectangle',
    rounded: true,
    width: '240px',
    height: '120px',
  },
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every shape + the `rounded` toggle + a real composition, in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Shapes */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Skeleton variant="rectangle" width="160px" height="100px" />
        <Skeleton variant="circle" width="64px" height="64px" />
        <Skeleton variant="line" width="200px" height="0.875rem" />
      </div>

      {/* rounded={false} squares rectangle/line; circle stays round */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Skeleton
          variant="rectangle"
          rounded={false}
          width="160px"
          height="100px"
        />
        <Skeleton variant="circle" rounded={false} width="64px" height="64px" />
        <Skeleton
          variant="line"
          rounded={false}
          width="200px"
          height="0.875rem"
        />
      </div>

      {/* Composition: an avatar + a two-line text block */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Skeleton variant="circle" width="48px" height="48px" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Skeleton variant="line" width="180px" height="0.875rem" />
          <Skeleton variant="line" width="120px" height="0.75rem" />
        </div>
      </div>
    </div>
  ),
}
