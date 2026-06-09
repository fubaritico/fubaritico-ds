// Theme + skin are decoupled and loaded separately (see @fubaritico-ds/styles):
// tokens provide the --color-*/--spacing-*/--font-* variables; the skin provides the BEM classes.
import '@fubaritico-ds/shared/fonts.css'
import '@fubaritico-ds/tokens/css'
import '@fubaritico-ds/styles/styles.css'

import type { Preview } from '@storybook/react-vite'

/**
 * Global Storybook preview: loads tokens + native skin so the BEM classes emitted by
 * `@fubaritico-ds/variants` render with the real design-system look.
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
