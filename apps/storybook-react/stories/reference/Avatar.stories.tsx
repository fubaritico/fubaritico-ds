// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Avatar } from '@fubaritico-ds/reference/Avatar'

import type { Meta, StoryObj } from '@storybook/react-vite'

const SAMPLE_SRC = 'https://i.pravatar.cc/150?img=12'

/**
 * Avatar — circular media slot migrated to the native BEM skin (`@fubaritico-ds/styles`); the size
 * resolves to a BEM class via `@fubaritico-ds/variants`. It resolves the best representation in
 * order: image → initials → `User` icon, with automatic fallback on image load failure.
 */
const meta = {
  title: 'Reference/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    src: { control: 'text' },
    alt: { control: 'text' },
    initials: { control: 'text' },
  },
  args: {
    size: 'md',
    src: SAMPLE_SRC,
    alt: 'Jane Doe',
    initials: 'JD',
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every size and every fallback tier (image · initials · icon) in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Sizes (image) */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="xs" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="sm" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="md" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="lg" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="xl" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="2xl" />
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="3xl" />
      </div>
      {/* Fallback tiers: image → initials → icon */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Avatar src={SAMPLE_SRC} alt="Jane Doe" size="lg" />
        <Avatar alt="Jane Doe" initials="JD" size="lg" />
        <Avatar alt="Unknown user" size="lg" />
      </div>
    </div>
  ),
}
