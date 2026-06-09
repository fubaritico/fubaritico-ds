import type { StorybookConfig } from '@storybook/react-vite'

/**
 * Storybook 10 config for the React app. Hosts the hand-made `@fubaritico-ds/reference`
 * components (group `Reference/*`) and, later, the Stencil-generated React wrappers
 * (group `Generated/*`). Stories live in this app under `stories/`, not co-located.
 */
const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config
