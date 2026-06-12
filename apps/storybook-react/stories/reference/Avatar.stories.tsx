// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Avatar } from '@fubaritico-ds/reference/Avatar'
import { Spinner } from '@fubaritico-ds/reference/Spinner'

import type { Meta, StoryObj } from '@storybook/react-vite'

const SAMPLE_SRC = 'https://i.pravatar.cc/150?img=12'
const BROKEN_SRC = 'https://invalid.example/nope.jpg'

/**
 * Avatar — compound, headless-style media slot migrated to the native BEM skin
 * (`@fubaritico-ds/styles`). Declare ordered candidates inside `Avatar.Fallback`; the resolution
 * cascade renders the first viable one (image → initials → icon), blocking on a loading image.
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
    'aria-label': { control: 'text' },
  },
  args: {
    size: 'md',
    'aria-label': 'Jane Doe',
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground — full cascade (image → initials → icon) driven by the controls. */
export const Playground: Story = {
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Fallback>
        <Avatar.Image src={SAMPLE_SRC} />
        <Avatar.Initials>JD</Avatar.Initials>
        <Avatar.Icon />
      </Avatar.Fallback>
    </Avatar>
  ),
}

/** Every size and every resolution tier (image · initials · icon · broken→fallback) in one view. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Sizes (image tier) */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
          <Avatar key={size} size={size} aria-label="Jane Doe">
            <Avatar.Fallback>
              <Avatar.Image src={SAMPLE_SRC} />
              <Avatar.Icon />
            </Avatar.Fallback>
          </Avatar>
        ))}
      </div>
      {/* Resolution tiers: image → initials → icon, and a broken source falling back */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Avatar size="lg" aria-label="Loaded image">
          <Avatar.Fallback>
            <Avatar.Image src={SAMPLE_SRC} />
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
        <Avatar size="lg" aria-label="Initials only">
          <Avatar.Fallback>
            <Avatar.Initials>JD</Avatar.Initials>
          </Avatar.Fallback>
        </Avatar>
        <Avatar size="lg" aria-label="Icon only">
          <Avatar.Fallback>
            <Avatar.Icon name="User" />
          </Avatar.Fallback>
        </Avatar>
        <Avatar size="lg" aria-label="Broken image, falls back to initials">
          <Avatar.Fallback>
            <Avatar.Image src={BROKEN_SRC} />
            <Avatar.Initials>JD</Avatar.Initials>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      </div>
      {/* Loading affordance via the Image render-prop: a Spinner shows while the image loads. */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Avatar size="lg" aria-label="Loading with a spinner">
          <Avatar.Fallback>
            <Avatar.Image src={SAMPLE_SRC}>
              {(status) =>
                status === 'loading' ? <Spinner size="sm" /> : null
              }
            </Avatar.Image>
            <Avatar.Icon />
          </Avatar.Fallback>
        </Avatar>
      </div>
    </div>
  ),
}
